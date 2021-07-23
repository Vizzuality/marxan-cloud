@implemented
Feature: LogIn

  I want to log in

  Scenario: Logging in
    Given I am on a main page
    When I tap on the Sign In on Navigation Bar
    When I type username and password
    When I tap on Sign In under form
    Then I see my dashboard
