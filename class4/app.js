console.log("app.js loaded");


const cards = document.querySelector("#user-cards");




// promise for return user data from server
// const userData = new Promise((resolve, reject) => {
//     let error = true
//     if (error) {
//         reject({
//             message: "Error in fetching user data",
//             status: 500,
//         })
//     }
//     resolve(user)
// })

// async function name() {

// }

// const name = async () => {

// }


// userData.then((data) => {
//     console.log(data);
// }).catch(error => {
//     console.log(error);
// }).finally(() => {
//     console.log("finally block");
// })

// const fetchData = async () => {
//     try {
//         let data = await userData
//         console.log(data);
//     }
//     catch (error) {
//         console.log(error);
//     } finally {
//         console.log("finally block");
//     }
// }


// fetchData()

// https://jsonplaceholder.typicode.com/users


const fetchUserData = async () => {
    try {
        let userData = await fetch("https://jsonplaceholder.typicode.com/users")
        let data = await userData.json()
        console.log(data);

        data.forEach((user) => {
            const card = document.createElement("article");
            card.className = "flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]";

            const initials = user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2);

            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">${initials}</div>
                    <div>
                        <h2 class="text-lg font-semibold text-slate-900">${user.name}</h2>
                        <p class="text-sm text-slate-500">${user.age} years · ${user.city}, ${user.state}</p>
                    </div>
                </div>
                <dl class="grid gap-2 text-sm text-slate-700">
                    <div><dt class="text-xs uppercase tracking-wide text-slate-400">Email</dt><dd>${user.email}</dd></div>
                    <div><dt class="text-xs uppercase tracking-wide text-slate-400">Phone</dt><dd>${user.phone}</dd></div>
                    <div><dt class="text-xs uppercase tracking-wide text-slate-400">Address</dt><dd>${user.address}, ${user.zip}, ${user.country}</dd></div>
                </dl>
            `;

            cards.append(card);
            // cards.innerHTML = 
        });

    } catch (error) {
        console.log(error);

    }
}

fetchUserData()