


	
const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php';

/*
 To get a specific play, add play's id property (in plays.json) via query string, 
   e.g., url = url + '?name=hamlet';
 
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=hamlet
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=jcaesar
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=macbeth
 
 NOTE: Only a few plays have text available. If the filename property of the play is empty, 
 then there is no play text available.
*/
 

/* note: you may get a CORS error if you test this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/
