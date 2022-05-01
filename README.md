# MQP

This branch is used to show how to add another pedestrian to the simulation.

**Instructions for adding another pedestrian:**

1. In app/pop.js make a copy of function Adult(j,jj) and change this.code, this.profile_i, this.profile_ii, this.width, this.height, this.type, and this.color.
2. Add the new pedestrian type to the function types()
3. Add the creation of the new pedestrian to the function factory(tpe, j, jj) 
4. In app/data.js add the number of new pedestrians you want on the grid. Add two lines under the line data.current['AdultBike'] = data.max['AdultBike']; that say data.max['new_pedestrian_type'] = number of new pedestrians you want on board; and data.current['new_pedestrian_type'] = data.max['new_pedestrian_type'];
5. In app/final.html add a line underneath the line that states: Adults with bikes: <span id="num_AdultBike_initial"></span><br> that says: Whatever you want here: <span id="num_newPedestrianType_initial"></span><br>

**Note:**

This tutorial adds in the number of new pedestrians manually, if you want to add the new pedestrian to the GUI input, you would have to add an input in app/final.html and you would have to add getting the input in app/gui.js .

