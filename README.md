#Git steps to connect and update yur repo

0. cd repository/dir/in-this-case/LMS-noTS-MERN
1. git init        (it will initialize the repo that's on the curren location, and if none is present, it will initialize one here)
2. Make changes
3. git add .       (Stages all the changes to be commited)
4. git commit -m "Commit message, the flag *m is for adding an optional message"
5. git push        (Pushes the commited changes to the GitHub repo online)
6. Manually deploy lastest version on the last commit rather on the backen, frontend or both services on Render, depending on the changes the services that need to be built and deployed
7. Enjoy ur changes
