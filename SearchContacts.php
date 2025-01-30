<?php
// Tested Search & works!
$inData = getRequestInfo();

$searchResults = "";
$searchCount = 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    returnWithError( $conn->connect_error );
}
else
{
    // We look for partial matches in first name, last name, email, or phone
    // for the logged in user.
    $stmt = $conn->prepare("SELECT * FROM Contacts 
                            WHERE (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ? OR Phone LIKE ?) 
                              AND UserID = ?");
    $searchInput = "%" . $inData["searchInput"] . "%";
    $stmt->bind_param("ssssi", $searchInput, $searchInput, $searchInput, $searchInput, $inData["UserID"]);
    $stmt->execute();

    $result = $stmt->get_result();

    while($row = $result->fetch_assoc())
    {
        if( $searchCount > 0 )
        {
            $searchResults .= ",";
        }
        $searchCount++;

        // Return the ContactID so we can edit/delete by ID if we want.
        $searchResults .= '{"ContactID":"' . $row["ID"] . '",';
        $searchResults .= '"FirstName":"' . $row["FirstName"]. '",';
        $searchResults .= '"LastName":"' . $row["LastName"]. '",';
        $searchResults .= '"Phone":"' . $row["Phone"]. '",';
        $searchResults .= '"Email":"' . $row["Email"]. '"}';
    }

    if( $searchCount == 0 )
    {
        returnWithError( "No Records Found" );
    }
    else
    {
        returnWithInfo( $searchResults );
    }

    $stmt->close();
    $conn->close();
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
    $retValue = '{"ID":0,"FirstName":"","LastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}

function returnWithInfo( $searchResults )
{
    $retValue = '{"results":[' . $searchResults . '],"error":""}';
    sendResultInfoAsJson( $retValue );
}
?>
