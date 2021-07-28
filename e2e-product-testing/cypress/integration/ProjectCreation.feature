@implemented
Feature: Create Project

  I want to create Project

  Background:
    Given I am on Projects page
    And I am logged in

  Scenario: Creating Project
    When I tap on Create new project
    And I type unique name into Project Name
    And I type "Lorem Ipsum" into Project Description
    And I press Save Project
    Then the Project is created
