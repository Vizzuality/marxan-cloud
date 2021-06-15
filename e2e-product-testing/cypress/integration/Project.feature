Feature: Project dashboard actions
    Scenario: See user's projects
        Given the user has logged-in succesfuly
        When the user is redirected to his/her project dashboard
        Then the user sees all his/her projects
    Scenario: Search a project with correct keywords
        Given the user is in his/her project dashboard
        When the user uses the search bar and types a keyword that matches a project
        Then Only the projects that match the keyword are shown
    Scenario: Search a project with incorrect keywords
        Given the user is in his/her project dashboard
        When the user uses the search bar and types a keyword that does not match any project
        Then No projects are shown 
    Scenario: Eliminate a project
        Given the user is in his/her project dashboard
        When the user deletes a project  
        Then The project is no longer in the users's dashboard
    Scenario: Create new project
        Given the user is in his/her project dashboard
        When the user creates a new project
        Then the user is taken to the New Project Landing page
    Scenario: Duplicate a project
        Given the user is in his/her project dashboard
        When the user duplicates a project  
        Then a new project appears in the dashboard 
    Scenario: Download a project
        Given the user is in his/her project dashboard
        When the user downloads a project  
        Then the user receives a bundle zip with all the input + output + planning unit files in his/her local machine 
    Scenario: Upload a project with correct files
        Given the user is in his/her project dashboard
        When the user uploads a project with correct files
        Then a new project appears in the dashboard
    Scenario: Upload a project with incorrect files
        Given the user is in his/her project dashboard
        When the user uploads a project with incorrect files
        Then the user receives a message on screen where to find instructions  

Feature: Share projects
    Scenario: Share a project with contributors with Marxan profile
        Given the user is inside a Project (Marxan 03a_hover)
        And the user is in Add/Remove Members
        When the user adds a contributor with a Marxan profile
        Then the contributor appears on the project contributor list
    Scenario: Share a project with contributor without Marxan profile
        Given the user is inside a Project (Marxan 03a_hover)
        And the user is in Add/Remove Members
        When the user adds an email for a contributor without a Marxan profile
        Then the contributor receives an email notification
    Scenario: Search contributors
        Given the user is inside a Project (Marxan 03a_hover)
        And the user is in Add/Remove Members
        When the user is searches for a contributor by keywords
        Then only the contributors that match the keywords appear
        
Feature: Add new planning region
    Scenario: User without planning region shp
        Given the user is in the New Project Landing page
        And the user is DOES NOT have a planning region shapefile
        When the user selectS a country and sub-region
        Then the user see the contour area on the map
    Scenario: User with correct planning region shp
        Given the user is in the New Project Landing page
        And the user has a correct planning region shapefile
        When the user uploads his/her shp
        Then the user sees the contour area on the map
    Scenario: User with incorrect planning region shp
        Given the user is in the New Project Landing page
        And the user has an incorrect planning region shapefile
        When the user uploads his/her shp
        Then the user gets an error message
    
Feature: Add new planning grid
    Scenario: User without grid and correct shape/size combination
        Given the user is in the New Project Landing page
        And the user has added a planning region
        And the user DOES NOT have a planning unit grid 
        When the user chooses a correct combination of shape and size
        Then The grid appears on the map
    Scenario: User without grid and incorrect shape/size combination
        Given the user is in the New Project Landing page
        And the user has added a planning region
        And the user DOES NOT have a planning unit grid 
        When the user chooses an incorrect combination of shape and size
        Then the user gets an error message
    Scenario: User with correct grid shp
        Given the user is in the New Project Landing page
        And the user has added a planning region
        And the user has a correct planning unit grid shp
        When the user uploads his/her shp
        Then The grid appears on the map
    Scenario: User with incorrect grid shp
        Given the user is in the New Project Landing page
        And the user has added a planning region
        And the user has an incorrect planning unit grid shp
        When the user uploads his/her shp
        Then the user gets an error message

Feature: Save project
    Scenario: Completed all steps
        Given the user is in the New Porject Landing page
        And the user has added both a planning region and a grid
        When the user Saves the project
        Then the project shows in his/her Project dashboard
