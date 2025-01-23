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
                $stmt = $conn->prepare("select * from Contacts where (FirstName like ? OR LastName like ? OR Email like ? OR Phone like ?) and UserID=?");
                $searchInput = "%" . $inData["searchInput"] . "%";
                $stmt->bind_param("ssssi", $searchInput, $searchInput, $searchInput, $searchInput, $inData["UserID"]); // should the last s be an i?
                $stmt->execute();

                $result = $stmt->get_result();

                while($row = $result->fetch_assoc())
                {
                        if( $searchCount > 0 )
                        {
                                $searchResults .= ",";
                        }
                        $searchCount++;

                        // Logic taken from Leinecker YouTube tutorial of array of json objects
                        $searchResults .= '{"FirstName" : "' . $row["FirstName"]. '", "LastName" : "' . $row["LastName"]. '", "Phone" : "' . $row["Phone"]. '", "Email" : "' . $row["Email"]. '"}';
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
