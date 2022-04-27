# MQP

Github pages site: https://vlm-wpi.github.io/MQP/app/final.html

This GitHub Repository represents the work of Worcester Polytechnic Institute (WPI) students for their senior capstone project and is titled, 'Modeling Pedestrian Flow: A Path-Finding Approach.'  The simulation tool can be used to model pedestrian movement in an enclosed space given several initial parameters (that the user can input), and will return several statistics.  The team pulled inspiration from the simulation and code found at http://www.natureincode.com/code/various/ants.html.

**The simulation can be run in four ways:**

a. Online through the GUI (graphical user interface)

b. Locally on your device using the GUI

c. Locally on your device through the command prompt/terminal (no GUI component)

d. Through a remote server (no GUI component)

Regardless of how the simulation is run, the user has the ability to input several parameters including:

* Number of Children/Adults/Adults with Backpacks/Adults with Bikes

* Number of Exits

* Number of Obstacles

* Width/Height of Grid

* Initial Layout (Randomized will produce a random layout, where as the other options for layouts are representations of a classroom, a lecture hall, a specific lecture hall at WPI, or a user input file - see below for how to construct such a file)

* Choice of Heuristic Function (Diagonal Distance, Manhattan Distance, or Euclidean Distance, representing how the heuristic function gets calculated)

* Choice of four Conflict Strategies (how pedestrians resolve conflicts when they run into one another and get stuck) and their thresholds (after how many 'stuck' steps the pedestrian will employ the specific conflict resolution strategy)

If the simulation is being run using the GUI, the user has the additional input options:

* Time between updates (representing the amount of time between each update of the board; a greater value will make the simulation appear slower)

* Choice of whether to Take Snapshot Images (if this is selected, a screenshot gets taken and downloaded to the users computer at each iteration of the simulation)

* Choice of what graphs to plot and print at the conclusion of the simulation

If the simulation is not being run using the GUI, but instead with headless mode, the user has the additional input options:

* Choice of what trial numbers (seeds) to run

* output (the user can specify the name of the output file with all requested statistics)

* Choice of what statistics will be output at the conclusion of the simulation

**Instructions for running the simulation:**

a. Online through the GUI (graphical user interface)

	1. Access the simulation using (website will go here)
	
	2. Input the requested initialization parameters
	
	3. Click 'Start' button
	
	Notes:
		
		* The user MUST clear the simulation between runs using the 'Clear' button in order for the simulation to run appropriately
		
		* The simulation will randomly populate with each run, so a user likely will not be able to achieve the same initial configuration more than once
		
		* The simulation will end automatically when all pedestrians that are able to have left the grid, but the user can also select the 'End' button at any time


b. Locally on your device using the GUI
	
	Steps for the first time running the simulation:
		
		1. Open command prompt on your device
		
		2. 'cd' into the location where you would like to save the MQP folder (ex: 'cd Documents')
		
		3. Clone the git repository using the command 'git clone https://github.com/vlm-wpi/MQP.git'
		
	
	Steps for every time running the simulation:
		
		1. Using the file directory, navigate to the location where you cloned the git repository
		
		2. Click into the MQP folder, then the app folder, and finally click to open the 'final.html' file using your browser


c. Locally on your device through the command prompt/terminal using headless mode (no GUI component)
	
	Steps for the first time running the simulation:
		
		1. Install node.js on your computer
		
		2. Open the command prompt
		
		3. Navigate to the location in your file directory where you want to save the code using 'cd' and the location (ex: 'cd\Documents\MQP') 
		
		4. Type 'git clone https://github.com/vlm-wpi/MQP.git' to clone the repository in that location
		
		5. While still in that location, type the following two commands:
			
			* 'npm install yargs'
			
			* 'npm install random-seed'

	
	Steps for every time running the simulation:
		
		1. Open the command prompt
		
		2. Navigate to the location in your file directory where the code is saved using 'cd' and the location (ex: 'cd\Documents\MQP')
		
		3. Within the code, navigate to inside of 'app' by using cd again ('cd app')
		
		4. Run the command beginning with 'trial.bat' followed by your inputs for grid size, number of pedestrians, etc., and then followed by the variables that you wish to output
			
			* Ex: trial.bat 100 105 --width=50 --height=50 --c=10 --a=10 --abp=10 --ab=0 --e=1 --o=0 --heuristic=euclidean --layout=Randomized --conflict1=ChooseRandomMove-3 --conflict2=ChooseDifferentExit-6 --conflict3=NullConflictStrategy-9 --conflict4=NullConflictStrategy-12 --save_path=true --output=output_file data.max data.width_i data.width_ii final.total_exit_time final.avg_exit_time final.avg_collisions_total final.total_avg_occ_all_time final.total_eval final.evaluation_metric final.initial_path_layout final.path_i_taken final.path_ii_taken final.all_paths_i_taken final.all_paths_ii_taken final.deadlock


d. Through a remote server (no GUI component)
	
	Steps for the first time running the simulation:
		
		1. Download FileZilla
		
		2. Connect to the appropriate VPN if needed
		
		3. Open the command prompt
		
		4. Ssh into the server you would like to use and enter your password if prompted to do so
		
		5. Type 'git clone https://github.com/vlm-wpi/MQP.git' to clone the repository
		
		6. Type 'ls' to make sure that 'MQP' is now there 
		
		7. Navigate into the 'app' folder part of 'MQP' by doing
			
			* 'cd MQP'
			
			* 'cd app'
		
		8. While still in that location, type the following two commands:
			
			* 'npm install yargs'
			
			* 'npm install random-seed'

	Steps for every time running the simulation:
		
		1. Connect to the appropriate VPN if needed
		
		2. Open the command prompt 
		
		3. Ssh into the server you would like to use and enter your password if prompted to do so
		
		4. Navigate to the location in your file directory where the code is saved using 'cd' and the location (ex: 'cd\Documents\MQP')
		
		5. Navigate into the 'app' folder part of 'MQP' by doing
			
			* 'cd MQP'
			
			* 'cd app'
		
		6. Run the command beginning with 'bash trial.sh' followed by your inputs for grid size, number of pedestrians, etc., and then followed by the variables that you wish to output
			
			* Ex:  bash trial.sh 100 105 --width=50 --height=50 --c=10 --a=10 --abp=10 --ab=0 --e=1 --o=0 --heuristic=euclidean --layout=Randomized --conflict1=ChooseRandomMove-3 --conflict2=ChooseDifferentExit-6 --conflict3=NullConflictStrategy-9 --conflict4=NullConflictStrategy-12 --save_path=true --output=output_file data.max data.width_i data.width_ii final.total_exit_time final.avg_exit_time final.avg_collisions_total final.total_avg_occ_all_time final.total_eval final.evaluation_metric final.initial_path_layout final.path_i_taken final.path_ii_taken final.all_paths_i_taken final.all_paths_ii_taken final.deadlock
		
		7. Connect to the server in FileZilla
		
		8. Once the trials have stopped running, you can transfer the output file from the server back to your device by dragging and dropping it into the desired location

**Acknowledgments**
We stared with the code from an ant simulation taken froom here: http://www.natureincode.com/code/various/ants.html
