<?php
// Purpose: Check whether a given username is already in use in the Users table.
$inData = getRequestInfo();

// Pull "Login" from the incoming JSON
$login = $inData["Login"] ?? "";

$foundContacts = 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error)
{
    returnWithError($conn->connect_error);
}
else
{
    // Prepare statement to see if the "Login" is used by any row
    $stmt = $conn->prepare("SELECT Login FROM Users WHERE Login=?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    
    $result = $stmt->get_result();
    while($row = $result->fetch_assoc())
    {
        $foundContacts++;
    }
    
    $stmt->close();
    $conn->close();
    
    // Return that count as JSON
    returnWithInfo($foundContacts);
}

// Helper: Retrieve request JSON
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

// Helper: Return JSON with an "error"
function returnWithError($err)
{
    $retValue = '{"foundContacts":0,"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
    exit();
}

// Helper: Return JSON with foundContacts
function returnWithInfo($count)
{
    $retValue = '{"foundContacts":' . $count . ',"error":""}';
    sendResultInfoAsJson($retValue);
    exit();
}

// Helper: Send JSON
function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}
?>
