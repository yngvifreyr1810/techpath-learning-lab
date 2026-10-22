$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$request = [Console]::In.ReadToEnd() | ConvertFrom-Json
$config = $request.config
if ($config.database -notmatch '^TechPathLab_[a-f0-9]{12}$' -or $config.owner -notmatch '^[a-f0-9-]{36}$') { throw 'Invalid lab identity' }
Add-Type -AssemblyName System.Data
function Open-LabConnection([string]$database) {
    $builder = New-Object System.Data.SqlClient.SqlConnectionStringBuilder
    $builder['Data Source'] = $config.server
    $builder['Initial Catalog'] = $database
    $builder['Integrated Security'] = $true
    $builder['Pooling'] = $false
    $builder['Connect Timeout'] = 6
    $builder['Application Name'] = 'TechPath SQL Lab'
    $connection = New-Object System.Data.SqlClient.SqlConnection($builder.ConnectionString)
    $connection.Open()
    return $connection
}
$connection = $null
$results = New-Object System.Collections.ArrayList
$messages = New-Object System.Collections.ArrayList
$truncated = $false
$outputChars = 0
$watch = [Diagnostics.Stopwatch]::StartNew()
try {
    if ($request.action -eq 'setup') {
        $connection = Open-LabConnection 'master'
        $command = $connection.CreateCommand()
        $command.CommandTimeout = 20
        $command.CommandText = "SELECT DB_ID(N'$($config.database)')"
        $exists = $command.ExecuteScalar()
        if ($exists -is [DBNull]) {
            $command.CommandText = "CREATE DATABASE [$($config.database)]"
            [void]$command.ExecuteNonQuery()
            $command.CommandText = "ALTER DATABASE [$($config.database)] SET TRUSTWORTHY OFF; ALTER DATABASE [$($config.database)] SET DB_CHAINING OFF;"
            [void]$command.ExecuteNonQuery()
            $connection.Close()
            $connection = Open-LabConnection $config.database
            $command = $connection.CreateCommand()
            $command.CommandText = "EXEC sys.sp_addextendedproperty @name=N'TechPathOwner', @value=N'$($config.owner)';"
            [void]$command.ExecuteNonQuery()
        } else {
            $connection.Close()
            $connection = Open-LabConnection $config.database
            $command = $connection.CreateCommand()
            $command.CommandText = "SELECT CAST(value AS nvarchar(100)) FROM sys.extended_properties WHERE class=0 AND name=N'TechPathOwner'"
            if ($command.ExecuteScalar() -ne $config.owner) { throw 'Database identity mismatch; no data was changed.' }
        }
        $command.CommandText = "SELECT OBJECT_ID(N'dbo.Customers')"
        if ($command.ExecuteScalar() -is [DBNull]) {
            $command.CommandText = "SET XACT_ABORT ON; BEGIN TRANSACTION;`n$($request.seed)`nCOMMIT;"
            [void]$command.ExecuteNonQuery()
        }
        $command.CommandText = @"
IF DATABASE_PRINCIPAL_ID(N'TechPathLearner') IS NULL CREATE USER [TechPathLearner] WITHOUT LOGIN;
GRANT SELECT, VIEW DEFINITION, EXECUTE ON SCHEMA::dbo TO [TechPathLearner];
GRANT CREATE PROCEDURE TO [TechPathLearner];
GRANT ALTER ON SCHEMA::dbo TO [TechPathLearner];
"@
        [void]$command.ExecuteNonQuery()
        @{ok=$true; database=$config.database; server=$config.server} | ConvertTo-Json -Compress
    } elseif ($request.action -eq 'run') {
        $connection = Open-LabConnection $config.database
        $command = $connection.CreateCommand()
        $command.CommandText = "EXECUTE AS USER = N'TechPathLearner' WITH NO REVERT; SET LOCK_TIMEOUT 3000;"
        [void]$command.ExecuteNonQuery()
        $handler = [System.Data.SqlClient.SqlInfoMessageEventHandler]{ param($sender,$event) foreach($item in $event.Errors) { if($messages.Count -lt 20) { [void]$messages.Add($item.Message) } } }
        $connection.add_InfoMessage($handler)
        :batchLoop foreach ($batch in $request.batches) {
            if ($watch.Elapsed.TotalSeconds -gt 30) { throw 'Query exceeded the 30-second lab limit.' }
            $command = $connection.CreateCommand()
            $command.CommandTimeout = 10
            $command.CommandText = $batch.sql
            $reader = $command.ExecuteReader()
            try {
                do {
                    if ($reader.FieldCount -gt 0) {
                        if ($results.Count -ge 10 -or $reader.FieldCount -gt 100) { $truncated=$true; $command.Cancel(); break batchLoop }
                        $columns = @();for($i=0;$i -lt $reader.FieldCount;$i++){ $columns += @{name=$reader.GetName($i);type=$reader.GetDataTypeName($i)} }
                        $rows = New-Object System.Collections.ArrayList
                        while ($reader.Read()) {
                            if ($rows.Count -ge 500) { $truncated=$true; break }
                            $values = @();for($i=0;$i -lt $reader.FieldCount;$i++) {
                                if ($reader.IsDBNull($i)) { $values += $null } else {
                                    $value=$reader.GetValue($i)
                                    if ($value -is [DateTime]) { $value=$value.ToString('o') }
                                    elseif ($value -is [byte[]]) { $value=[Convert]::ToBase64String($value) }
                                    elseif ($value -is [string] -and $value.Length -gt 4000) { $value=$value.Substring(0,4000); $truncated=$true }
                                    $outputChars += ([string]$value).Length
                                    if ($outputChars -gt 200000) { $truncated=$true }
                                    $values += $value
                                }
                            }
                            [void]$rows.Add($values)
                        }
                        [void]$results.Add(@{columns=@($columns);rows=@($rows.ToArray());batchLine=$batch.startLine})
                        if ($truncated) { $command.Cancel(); break batchLoop }
                    }
                } while ($reader.NextResult())
                if ($reader.RecordsAffected -ge 0 -and $messages.Count -lt 20) { [void]$messages.Add("$($reader.RecordsAffected) row(s) affected") }
            } finally { $reader.Dispose() }
        }
        @{ok=$true;results=@($results.ToArray());messages=@($messages.ToArray());truncated=$truncated;elapsedMs=$watch.ElapsedMilliseconds;database=$config.database} | ConvertTo-Json -Depth 12 -Compress
    } else { throw 'Unknown lab operation' }
} catch {
    $sqlError=$_.Exception
    while ($sqlError.InnerException) { $sqlError=$sqlError.InnerException }
    $errorInfo=@{message=$sqlError.Message}
    if ($sqlError -is [System.Data.SqlClient.SqlException]) { $first=$sqlError.Errors[0];$errorInfo.number=$first.Number;$errorInfo.line=$first.LineNumber;if($batch){$errorInfo.line+=$batch.startLine-1};$errorInfo.procedure=$first.Procedure }
    @{ok=$false;error=$errorInfo;results=@($results.ToArray());messages=@($messages.ToArray());elapsedMs=$watch.ElapsedMilliseconds;truncated=$truncated} | ConvertTo-Json -Depth 12 -Compress
} finally { if($connection){$connection.Dispose()} }
