<?php
// Code to edit contact info in database
$inData = getRequestInfo();

$userId    = $inData["UserID"];
$firstName = $inData["FirstName"];
$lastName  = $inData["LastName"];
$email     = $inData["Email"];
$phone     = $inData["Phone"];
$contactId = $inData["ContactID"]; 

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    returnWithError( $conn->connect_error );
}
else
{
    // Update all parameters for the specified contact
    $stmt = $conn->prepare("UPDATE Contacts 
                            SET FirstName=?, LastName=?, Email=?, Phone=? 
                            WHERE UserID=? AND ID=?");
    $stmt->bind_param("ssssii", $firstName, $lastName, $email, $phone, $userId, $contactId);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    returnWithError("");
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError( $err )
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}
?>
