INSERT INTO department (department_name)
VALUES ("Human Resources"),
       ("IT"),
       ("Finance"),
       ("Legal"),
       ("Training");
       ("Operations");


INSERT INTO job (title, salary, department_id)
VALUES ("Administration Officer", 70000, 1),
       ("IT Assistant", 45000, 2),
       ("Accountant", 60000, 3),
       ("Senior Accountant", 75000, 3),
       ("Senior IT Tech", 95000, 2),
       ("Legal Advisor", 75000, 4),
       ("Operator", 75000, 5);
       ("Trainer", 60000, 6);

    

INSERT INTO employee (first_name, last_name, job_id, manager_id)
VALUES ("Fank", "Wiliams", 1, 0),
       ("John", "Maclean", 2, 5),
       ("Adam", "Sandler", 3, 4),
       ("Henry", "Smith", 4, 0),
       ("William", "Bills", 5, 0),
       ("Andrea", "Anderson", 6, 0),
       ("Michelle", "Lafleur", 5, 0);

       
