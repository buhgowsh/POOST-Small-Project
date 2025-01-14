<?php
  // Code to Remove Contact from Database, loosely based on Leinecker's example code from small project tutorial.
        // Tested and works!

  // Store the name of the contact to remove from the Contacts table into the appropriate variables.
        $inData = getRequestInfo();
  $firstname = $inData["FirstName"];

        // Connect to the SQL Database and delete the contact using the given information from user.
        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error)
        {
	              returnWithError( $conn->connect_error );
        }
        else
        {
                $stmt = $conn->prepare("delete from Contacts where FirstName=?");
	              $stmt->bind_param("s", $firstname);
	              $stmt->execute();
	              $stmt->close();
	              $conn->close();
	              returnWithError("");
        }

        // The rest of this file is copied directly from Leinecker's example code.
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
