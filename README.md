#CashCount
---
Backend files for my CashCount app which was created to use at my YMCA job.  This is mostly simple CRUD functionality, creating and updating users, companies, containers within a specific company, and counts within a specific container.  Counts over a certain variance threshold will auto-email selected admin level users.

There are three levels of authorization.  Super admin are required to create a new company, along with the initial admin for that company.  They can also access and edit any company and its users and containers, and can post counts.  Company level admin can create and edit users and containers within their assigned company, and can elect to receive variance emails.  Company level users can post and view prior counts and notes.

The backend was built using Node.js with Express, with a PostgreSQL database.  The frontend was built using hooks based React, initialized with Create React App. Styling and responsiveness are done primarily using React Bootstrap, along with some pretty basic CSS files.

More details on the history of the project are available on the frontend README.  Frontend files are available at [CashCount-frontend](https://github.com/bpruitt63/cashCount-frontend).

The app is deployed on Heroku at [CashCount](https://cashcount.herokuapp.com/).  A sample account exists for anyone interested in trying it out.  The sample company name is "demo".  To log in as an admin on the demo account, the username is "demo" and the password is "demo1234".