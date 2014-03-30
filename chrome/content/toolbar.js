var addonLocation;
var x = 0;
function extLoc(addon) {
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	addonLocation = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file.path;
}


safeobserver = {
observe : function( aSubject, aTopic, aData ) {

	if ("http-on-modify-request" == aTopic) {
		var url = aSubject
		.QueryInterface(Components.interfaces.nsIHttpChannel)
		.originalURI.spec;

		if (url && !url.match('facebook')) {
			aSubject.cancel(Components.results.NS_BINDING_ABORTED);
		} 
		
	}
 }
 
 }; 
// safeobserver ends here.
   


function fileUrlToPath(fileurl){
	var ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	var fileHandler = ioService.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
	var file = fileHandler.getFileFromURLSpec(fileurl);
	var path = file.path;
	return(path);
}


function readFile(fileURL) {
		var filePath = fileUrlToPath(fileURL);

		var fileObj = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		fileObj.initWithPath(filePath);
		var reqObj = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		try{
			reqObj.open('GET', fileURL, false );
			reqObj.setRequestHeader('Content-Type', 'text/plain');
			reqObj.send(true);
			return reqObj.responseText;
		}
		catch(e) {
				//alert("error retrieving standard.tmp file.");
				return (false);
		}
}

// get the path to the user's home (profile) directory
function getUserProfileDirectory(){
	var path;
	const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
	try { 
			path=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
	} catch (e) {
			alert("error retrieving user's profile directory.");
	}
	// determine the file-separator
	if (path.search(/\\/) != -1) {
			path = path + "\\";
	} else {
			path = path + "/";
	}
	return(path);
}



function getConfig(configFile){
	var userfile = configFile;
	AddonManager.getAddonByID("toolbar@projectsupriyo.net", extLoc);

	//var profileDir = getUserProfileDirectory();
	//userfile = "file://" + profileDir + userfile;

	userfile = "file://" + window.addonLocation + "\\" + userfile;
	var jsonObj = null;
	try{
		var data = readFile(userfile);
		//alert(data);
		if(data == ""){
			alert("No config settings found in common_setting.json file");	
		}
		jsonObj = eval("(" + data + ")");
		
	} // try ends
	catch (e2) {
		//alert("Dash it! Something crapped.");
	}
	return(jsonObj);
}


function writeStandardModeFile(value) {
	var userFilePath = "standard.tmp";
	//var profPath = getUserProfileDirectory();
	//userFilePath = fileUrlToPath("file://" + profPath + userFilePath);
	AddonManager.getAddonByID("toolbar@projectsupriyo.net", extLoc);
	fileUrl = "file://" + window.addonLocation + "\\" + userFilePath;
	userFilePath = fileUrlToPath(fileUrl);
	//alert("WRITE: " + fileUrl);
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	//file.initWithPath(userFilePath);
	file.initWithPath(userFilePath);
	try{
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);  // Open with appropriate permissions.
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(value);
		converter.close(); // this closes converter
		foStream.close(); // this closes foStream
	}
	catch(e2){
		//alert("Something crapped again, but we do not want to talk about it.");
	}
}



var myscope1 = {


pa: function(event) {
	var common_setting = getConfig("common_setting.json");

if(typeof Observerone === "undefined"){ }
else{ if ( x == 1) {
        Observerone.removeObserver(safeobserver, "http-on-modify-request");
        x = x-1 ;
        
}
}
openUILinkIn(common_setting.personal_area_url, "current");

},
// End of pa: function

safemode : function (event) {

Observerone = Components.classes["@mozilla.org/observer-service;1"]
  .getService(Components.interfaces.nsIObserverService);

Observerone.addObserver(safeobserver,"http-on-modify-request", false);

x = x +1 ;
// Write 0 in standard.tmp and deactivate standard mode.
	writeStandardModeFile("0");

}

};


  
// End of myscope1

var myscope2 = {

// Logic: When the user clicks on the standard button, the extension checks to see if it has 
// got a file named "standard.tmp" in the profile directory. If that file is found, the extension
// reads the contents. The content value may be one of the following 2 options: 0 and 1. If the
// file  doesn't exist, or if the file exists and the content is 0, then the brower is not in
// standard mode. If the file exists and the content is 1, the browser is in standard mode.
// Once the mode is determined, the appropriate action is taken - namely, opening the URL pointed
// to by 'modes_standard_startpage_url' config setting if it wasn't in standard mode, and
// doing nothing if it were in standard mode already.
standardmode: function(event){
   if(typeof Observerone === "undefined"  ){ }
else{ if (x == 1){
        Observerone.removeObserver(safeobserver, "http-on-modify-request");
        x = x-1;

}
}
	var tmpFile = "standard.tmp";
	//Read config from common_setting.json
	var common_setting = getConfig("common_setting.json");
	AddonManager.getAddonByID("toolbar@projectsupriyo.net", extLoc);
	tmpFile = "file://" + window.addonLocation + "\\" + tmpFile;
	//var profileDir = getUserProfileDirectory();
	//tmpFile = "file://" + profileDir + tmpFile;

	var tmpContent = readFile(tmpFile);
	if(tmpContent && tmpContent == "1"){ // Already in standard mode... nothing to do.
		alert("You are already in Standard Mode");
		//Send request for the url specified as the value of the 'modes_standard_startpage_url' setting.
		openUILinkIn(common_setting.modes_standard_startpage_url, "current"); // In case the user is on some other page.
	}
	else{ // Not in Standard Mode...  
		var authed = false;
		// Check common_setting config for password. If set, show a messagebox to enter the password.
		if(common_setting.modes_standard_password !=null && common_setting.modes_standard_password != ""){
			//var windowStyleVar = "top=10, left=10, width=250, height=200, status=no, menubar=no, toolbar=no scrollbars=no";
			//window.open("password.html", "passwordRequest", windowStyleVar);
			var password = prompt("Please enter the standard mode password: ");
			if(password == common_setting.modes_standard_password){
				authed = true;
			}
			else{
				return(0);
			}
		}
		else{ // Doesn't have password... So authed has no significance.
			authed = true;
		}
		// If user enters the password, and the password matches with value specified in common_setting.json,
		// then the user is allowed to access the facilities of standard mode. Creates the standard.tmp
		// file in profile dir, and sets the value to 1 in it.
		writeStandardModeFile("1");
		openUILinkIn(common_setting.modes_standard_startpage_url, "current");
	} // Done navigating to the standard mode startpage url.
}

} 
// End of myscope2

