Interval Filtering & FizzBuzz Printing
-----------------------
Prepare ranges from given include and exclude arrays. 

### Installation requirements
* Application was only tested with Node 6, Please make sure that you have NPM Installed

Installation
----------------------

### Downloading and Installing

* Clone this repo to your computer.
* Run `mkdir interval`.
* Get into the folder using `cd interval` Or traverse to the path and do CD
* Open Command Line and traverse to the interval folder created above
* Install the dependencies run the command > npm install
* run the command > node server.js
On successfull setup you should be able to see that server is running successfully


Usage
-----------------------
Please check the Postman Import file available in docs folder.
Below is just an information

Service Call#1: 
http://localhost:3000/getranges
Method Type: POST
Args: include, exclude

Service Call#2: 
http://localhost:3000/printfizzbuzz
Method Type: GET

Example Inputs and Outputs for Service call#1
-------------------------
Example 1: 

Includes: 10-100 

Excludes: 20-30 

Output should be: 10-19, 31-100 

Example 2: 

Includes: 50-5000, 10-100 

Excludes: (none) 

Output: 10-5000 

Example 3: 

Includes: 10-100, 200-300 


Excludes: 95-205 

Output: 10-94,206-300 

Example 4: 

Includes: 10-100, 200-300, 400-500 

Excludes: 95-205, 410-420 

Output: 10-94, 206-300, 400-409, 421-500


