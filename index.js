const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

//creates port - and local host 3001
const PORT = process.env.PORT || 3001;

// Connect to the company database
const db = mysql.createConnection(
	{
		host: "localhost",
		// MySQL username,
		user: "root",
		// MySQL password
		password: "admin",
		// database name
		database: "company_db",
	},
	console.log(`Connected to the books_db database.`)
);

// Array containing the main menu inquirer prompts
const mainMenu = [
	{
		type: "list",
		name: "menu",
		message: "What would you like to do?",
		choices: [
			"View All Employees",
			"Add an Employee",
			"Update an Employee Role",
			"View All Roles",
			"Add a Role",
			"View All Departments",
			"Add a Department",
			"Quit",
		],
	},
];

//function to render a table showing department names and ids
const mainMenuQuestions = async () => {
	return inquirer.prompt(mainMenu).then((answers) => {
		async function completeAction() {
			switch (answers.menu) {
				case "View All Departments":
					await viewDepartments();
					break;
				case "View All Employees":
					await viewEmployees();
					break;
				case "View All Roles":
					await viewRoles();
					break;
				case "Add an Employee":
					await renderEmployee();
					break;
				case "Update an Employee Role":
					await updateEmployee();
					break;
				case "Add a Role":
					await renderRole();
					break;
				case "Add a Department":
					await renderDepartment();
					break;
				case "Quit":
					inquirer.prompt().complete();
					break;
				default:
					throw new Error("didn't match an answer");
			}
		}

		completeAction().then(() => {
			mainMenuQuestions();
		});
	});
};

//function to create employee-
const renderEmployee = async (answers) => {
	const rolesPromise = new Promise((res) => {
		db.query("SELECT title, id FROM job", (err, results) => {
			if (err) {
				throw err;
			}
			return res(results);
		});
	});
	const managersPromise = new Promise((res) => {
		db.query(
			"SELECT first_name, last_name, id FROM employee",
			(err, results) => {
				if (err) {
					throw err;
				}
				return res(results);
			}
		);
	});

	const [roles, managers] = await Promise.all([
		rolesPromise,
		managersPromise,
	]);
	const roleTitles = roles.map(({ title }) => title);
	const managerNames = managers.map(
		({ first_name, last_name }) => `${first_name} ${last_name}`
	);

	return inquirer
		.prompt([
			{
				type: "input",
				name: "employeeFirstName",
				message: "What is the employee's first name?",
			},
			{
				type: "input",
				name: "employeeLastName",
				message: "What is the employee's last name?",
			},
			{
				type: "list",
				name: "employeeRole",
				message: "What is the employee's role?",
				choices: roleTitles,
			},
			{
				type: "list",
				name: "employeeManager",
				message: "Who is the employee's manager?",
				choices: ["none", ...managerNames],
			},
		])
		.then((answers) => {
			const selectedRole = roles.find(
				(role) => role.title === answers.employeeRole
			);
			const selectedManager = managers.find(
				(manager) =>
					`${manager.first_name} ${manager.last_name}` ===
					answers.employeeManager
			);
			const managersID = selectedManager ? selectedManager.id : 0;
			const newEmployee = [
				[
					answers.employeeFirstName,
					answers.employeeLastName,
					selectedRole.id,
					managersID,
				],
			];

			return new Promise((resolve) => {
				db.query(
					"INSERT INTO employee (first_name, last_name, job_id, manager_id) VALUES ?",
					[newEmployee],
					function (err, result) {
						if (err) throw err;
						console.log("Employee added to system!");
						resolve();
					}
				);
			});
		});
};

// Create role on request
const renderRole = async (answers) => {
	const departmentsPromise = new Promise((res) => {
		db.query(
			"SELECT department_name, id FROM department",
			(err, results) => {
				if (err) {
					throw err;
				}
				return res(results);
			}
		);
	});
	const departments = await departmentsPromise;
	const departmentNames = departments.map(
		({ department_name }) => department_name
	);
	return inquirer
		.prompt([
			{
				type: "input",
				name: "roleName",
				message: "What is the name of the new role?",
			},
			{
				type: "input",
				name: "roleSalary",
				message: "What is the salary of the new role?",
				validate: (answer) => {
					if (isNaN(answer)) {
						return "please enter a number";
					}
					return true;
				},
			},
			{
				type: "list",
				name: "departmentId",
				message: "What department is the new role in?",
				choices: departmentNames,
			},
		])
		.then((answers) => {
			console.log(answers);
			const selectedDepartment = departments.find(
				(department) =>
					department.department_name === answers.departmentId
			);
			const newRole = [
				[answers.roleName, answers.roleSalary, selectedDepartment.id],
			];
			return new Promise((resolve) => {
				db.query(
					"INSERT INTO job (title, salary, department_id) VALUES ?",
					[newRole],
					function (err, result) {
						if (err) throw err;
						console.log("New role added to system!");
						resolve();
					}
				);
			});
		});
};

// This function allows the user to view the roles in a table
function viewRoles(answers) {
	return new Promise((resolve) => {
		db.query("SELECT * FROM job", function (err, results) {
			if (err) {
				throw err;
			}
			if (results) {
				console.log("Showing All Roles");
				console.table(results);
				resolve();
			}
		});
	});
}

// Create department on request
const renderDepartment = async (answers) => {
	return inquirer
		.prompt([
			{
				type: "input",
				name: "departmentName",
				message: "What is the name of the department?",
			},
		])
		.then((answers) => {
			const newDepartment = [[[answers.departmentName]]];
			return new Promise((resolve) => {
				db.query(
					"INSERT INTO department (department_name) VALUES ?",
					newDepartment,
					function (err, result) {
						if (err) throw err;
						console.log("Department added to system!");
						resolve();
					}
				);
			});
		});
};

// This function allows the user to view the departments in a table
function viewDepartments() {
	return new Promise((resolve) => {
		db.query("SELECT * FROM department", function (err, results) {
			if (err) {
				throw err;
			}
			if (results) {
				console.log("Showing All Departments");
				console.table(results);
				resolve();
			}
		});
	});
}

// This function allows the user to view the employees in a table
function viewEmployees(answers) {
	return new Promise((resolve) => {
		db.query("SELECT * FROM employee", function (err, results) {
			if (err) {
				throw err;
			}
			if (results) {
				console.log("Showing All Employees");
				console.table(results);
				resolve();
			}
		});
	});
}

// Updates an employee's job role
const updateEmployee = async (answers) => {
	const employeesPromise = new Promise((res) => {
		db.query(
			"SELECT first_name, last_name, id FROM employee",
			(err, results) => {
				if (err) {
					throw err;
				}
				return res(results);
			}
		);
	});
	const rolesPromise = new Promise((res) => {
		db.query("SELECT title, id FROM job", (err, results) => {
			if (err) {
				throw err;
			}
			return res(results);
		});
	});
	const [roles, employees] = await Promise.all([
		rolesPromise,
		employeesPromise,
	]);
	const employeesNames = employees.map(
		({ first_name, last_name }) => `${first_name} ${last_name}`
	);
	const roleTitles = roles.map(({ title }) => title);
	return inquirer
		.prompt([
			{
				type: "list",
				name: "selectedEmployee",
				message: "Which employee's role would you like to update?",
				choices: employeesNames,
			},
			{
				type: "list",
				name: "employeeNewRole",
				message:
					"Which role would you like to assign to the selected employee?",
				choices: roleTitles,
			},
		])
		.then((answers) => {
			const selectedRole = roles.find(
				(role) => role.title === answers.employeeNewRole
			);
			const jobid = [[[selectedRole.id]]];
			const employeeID = employees.find(
				(employee) =>
					`${employee.first_name} ${employee.last_name}` ===
					answers.selectedEmployee
			);
			return new Promise((resolve) => {
				db.query(
					`UPDATE employee SET job_id = '${jobid}' WHERE id = ${employeeID.id};`,
					function (err, result) {
						if (err) throw err;
						console.log("Updated employee's role!");
						resolve();
					}
				);
			});
		});
};

// This starts the inquirer prompts :)
mainMenuQuestions();