<?php
        // Code to Add Contact to Database, based on Leinecker's example code from small project tutorial
        // Tested and works!

        $inData = getRequestInfo();

        $userId = $inData["UserID"];
        $firstName = $inData["FirstName"];
        $lastName = $inData["LastName"];
        $email = $inData["Email"];
        $phone = $inData["Phone"];


        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error)
        {
                returnWithError( $conn->connect_error );
        }
        else
        {
                $stmt = $conn->prepare("insert into Contacts (FirstName,LastName,Email,Phone,UserID) VALUES(?,?,?,?,?)");
                $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $userId);
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
