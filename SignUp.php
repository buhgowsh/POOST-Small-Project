<?php
  // Code to Sign Up a user in our contact manager, loosely based on Leinecker's example code from small project tutorial.
        // Tested and works!

  // Store the new account information into appropriate variables.
        $inData = getRequestInfo();
  $firstName = $inData["FirstName"];
  $lastName = $inData["LastName"];
  $login = $inData["Login"];
  $password = $inData["Password"];

        // Connect to the SQL Database and add the new account with the information from the user.
        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error)
	      {
          		  returnWithError( $conn->connect_error );
	      }
	      else
      	{
		            $stmt = $conn->prepare("insert into Users (FirstName,LastName,Login,Password) VALUES(?,?,?,?)");
		            $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
		            $stmt->execute();
		            $stmt->close();
		            $conn->close();
		            returnWithError("");
        }
 
        
        // The rest of this file is directly copied from Leinecker's example code. 
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

