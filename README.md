# HermesBot JS
This bot was created to play audio in a discord channel.  Enough said.

The following will demonstrate the process of installing and running this on a windows device.
> NOTE: A few of these instructions are more focused on developing the bot and not required simply run it.

## Install Git
Windows does not have a git management solution by default... which is dumb.  Because of this, it is recommended that you install a repository management solution.  I will be using Git, which can be downloaded using the following.

> https://git-scm.com/download/win

Follow documentation from the website to install.  When finished you will now be able to use `git` commands from the windows terminal.

## Cloning Project
Now we can get the project source code.  Navigate to a folder where you want to store the project.  For instance, we could store it directly in the `C` drive.

> `C:/repository/`

Open up either Terminal or PowerShell in this folder
> NOTE: You can right click in the explorer while holding the shift key to see an option to open PowerShell here.

Since we installed Git before, we have access to git commands in the consol.  This allows use to clone the project.  Run the following command.

> git clone https://github.com/TheORC/HermesBotJS.git

At this point you should have a local Git repository on your computer.  Changes you make to these files will be properly tracked and managed by the local Git install.  If you want to connect this with the online (github) repository you will need to make an SSH key and add it to the repository.  Tutorials for how to do this can be found online.

## Installing Dependences
While you now have the files, the project can't be run.  This makes sense as a few libraries and dependences still need to be installed.  These will be installed in the following section.

#### Installing Node
Yes, this is a Node JS project, kinda.  We actually only want the NPM package manager Node JS comes with.  This being said, HermesBotJS is an online service and in the future there are plans to integrate a website.  Navigate to the following website and install Node JS.  During the installation process make sure to `check` the optional build options (c++).  This will be important for installing NPM packages later.

> https://nodejs.org/en/

#### Installing Python
Yes, I know this is a JS project, however, it does make use of a python library.  This may be changed in the future to make the install simpler.  Install python from the following.  During the install process make sure to `check` the option to add python to the `$PATH` variable.

> https://www.python.org/downloads/

## Installing NPM packages
Nearly finished.  All that's left to do is install the libraries this project implements.  This should be a quick simple single command.  Navigate inside the project folder.  For instance.

> `C:/repository/HermesBotJS/`

Open a terminal here and run the following command.

> npm install

If you followed the above sections properly this will install all the requirements for the JS project.  HermesBotJS should now be able run.

## First Time Run
There are still a few small things to be completed before running the project.

First, inside the `src` folder, create an empty folder called `slash`.

> `C:/repository/HermesBotJS/src/slash`

In a future update the bot will implement slash commands.  Due to a bug at the moment, the project does not run if this folder does not exist.

The project also expects an `.env` file to be present.  This should be added to the base directory of the project.

> `C:/repository/HermesBotJS/.env`

This file should contain the following line of code.  Where `<Bot Token>` is your discord bots token.  There are tutorials online for creating discord bots.  For a quick reference check out the `discord development portal`.

> token=`<BOT TOKEN>`

## Finished
You are now finished installing the bot and ready to run it.  This can be achieved by running the following command in the base directory.

> npm start

If there are no errors, you are good to go!
