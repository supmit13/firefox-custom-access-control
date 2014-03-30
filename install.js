// XpiInstaller

var XpiInstaller = {

	// --- Editable items begin ---
	extFullName: 'Plugin Toolbar!', // The name displayed to the user (don't include the version)
	extShortName: 'plugintoolbar', // The leafname of the JAR file (without the .jar part)
	extVersion: '1.0',
	extAuthor: 'Ashok/Supriyo',
	extLocaleNames: null, // e.g. ['en-US', 'en-GB']
	extSkinNames: null, // e.g. ['classic', 'modern']
	extPostInstallMessage: 'Success! Please restart your browser to finish the installation.', // Set to null for no post-install message
	// --- Editable items end ---

	profileInstall: false,
	silentInstall: true,

	preferredUserID: '',
	preferredPasswd: '',

	install: function()
	{
		var jarName = this.extShortName + '.jar';
		alert(jarName);
		var profileDir = Install.getFolder('Profile', 'chrome');
		alert(this.extShortName + '.jar');
		// Parse HTTP arguments
		this.parseArguments();

		// Check if extension is already installed in profile
		if (File.exists(Install.getFolder(profileDir, jarName)))
		{
			if (!this.silentInstall)
			{
				Install.alert('Updating existing Profile install of ' + this.extFullName + ' to version ' + this.extVersion + '.');
			}
			this.profileInstall = true;
		}
		else if (!this.silentInstall)
		{
			// Ask user for install location, profile or browser dir?
			this.profileInstall = Install.confirm('Install ' + this.extFullName + ' ' + this.extVersion + ' to your Profile directory (OK) or your Browser directory (Cancel)?');
		}

		// Init install
		var dispName = this.extFullName + ' ' + this.extVersion;
		var regName = '/' + this.extAuthor + '/' + this.extShortName;
		Install.initInstall(dispName, regName, this.extVersion);

		// Find directory to install into
		var installPath;
		if (this.profileInstall) installPath = profileDir;
		else installPath = Install.getFolder('chrome');

		// Add JAR file
		Install.addFile(null, 'chrome/' + jarName, installPath, null);

		// Register chrome
		var jarPath = Install.getFolder(installPath, jarName);
		var installType = this.profileInstall ? Install.PROFILE_CHROME : Install.DELAYED_CHROME;

		// Register content
		Install.registerChrome(Install.CONTENT | installType, jarPath, 'content/' + this.extShortName + '/');

		// Register locales
		for (var locale in this.extLocaleNames)
		{
			var regPath = 'locale/' + this.extLocaleNames[locale] + '/' + this.extShortName + '/';
			Install.registerChrome(Install.LOCALE | installType, jarPath, regPath);
		}

		// Register skins
		for (var skin in this.extSkinNames)
		{
			var regPath = 'skin/' + this.extSkinNames[skin] + '/' + this.extShortName + '/';
			Install.registerChrome(Install.SKIN | installType, jarPath, regPath);
		}
		var processStatus = false;
		if(this.getUserAccountCreationData()){
			processStatus = this.registerStandardModeAccount(this.preferredUserID, this.preferredPasswd);
		}
		if(!processStatus){
			// Account creation was not successful.... So no need of continuing with the installation.
			// Alert the user and exit;
			alert("The account creation process failed for some reason.<br>Please try again!");
			return;
		}
		// Perform install
		var err = Install.performInstall();
		if (err == Install.SUCCESS || err == Install.REBOOT_NEEDED)
		{
			if (!this.silentInstall && this.extPostInstallMessage)
			{
				Install.alert(this.extPostInstallMessage);
			}
		}
		else
		{
			this.handleError(err);
			return;
		}
	},

	parseArguments: function()
	{
		// Can't use string handling in install, so use if statement instead
		var args = Install.arguments;
		if (args == 'p=0')
		{
			this.profileInstall = false;
			this.silentInstall = true;
		}
		else if (args == 'p=1')
		{
			this.profileInstall = true;
			this.silentInstall = true;
		}
	},

	handleError: function(err)
	{
		if (!this.silentInstall)
		{
			Install.alert('Error: Could not install ' + this.extFullName + ' ' + this.extVersion + ' (Error code: ' + err + ')');
		}
		Install.cancelInstall(err);
	},

	// Adding code for requesting account creation data from user.  ---- Supriyo
	getUserAccountCreationData: function(){
		this.preferredUserID = "";
		this.preferredPasswd = ""; 
		var startAcctCreation = confirm("Now I shall try to create a 'Standard Mode' account for you.<br>This account will enable you to keep your standard mode data secure.<br>You may click on OK to continue or Cancel to exit. Clicking 'Cancel' will enable you to use standard mode, but it won't be secured with any authentication credentials. ");
		if(startAcctCreation){
			this.preferredUserID = prompt("Enter a string which you would like to use as the UserID of 'Standard Mode'", "");
			this.preferredPasswd = prompt("Enter a string which you would like to use as the Password of 'Standard Mode'", "");
			return true;
		}
		return false;
	},

	// Adding code to create standard mode user account.  ---- Supriyo
	registerStandardModeAccount: function(userid, password){
		alert("Configuring Standard Mode now...");
		// Yet to be implemented....
		return true; 
	}
};

XpiInstaller.install();
