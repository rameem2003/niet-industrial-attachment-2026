let arr = ["Nazim", "Rony", "Ariful", "Sangma"]

// let found = arr.filter((name) => {
//     return name != "Rony" // ! =
// })

// console.log(found);

// arr.splice(1, 1, "Siam")

// console.log(arr);


// const scores = [88, 42, 95, 67, 31];

// let found = scores.find((number) => number == 67)

// let found = scores.findIndex((number) => number == 100)

// let found = scores.indexOf(67)

// console.log(found);




// let personName = "Mahmood Hassan Rameem"
// console.log(personName);

// console.log(name.length);

// console.log(name[0]);

// console.log(personName.charAt(0))

// let newName = personName.trim()

// console.log(newName);

// let newName = personName.slice(-7)

// console.log(newName);

// let data = personName.split(" ")

// console.log(data[2]);

// let nameArray = ['Mahmood', 'Hassan', 'Rameem']

// let nameString = nameArray.join(" ")

// console.log(nameString);

// array map, array foreach


let products = [
    {
        "id": 1,
        "title": "Wireless Bluetooth Headphones",
        "price": 89.99,
        "category": "Electronics",
        "inStock": true
    },
    {
        "id": 2,
        "title": "Ergonomic Office Chair",
        "price": 149.50,
        "category": "Furniture",
        "inStock": true
    },
    {
        "id": 3,
        "title": "Stainless Steel Water Bottle",
        "price": 24.95,
        "category": "Home & Kitchen",
        "inStock": false
    },
    {
        "id": 4,
        "title": "Running Shoes",
        "price": 110.00,
        "category": "Apparel",
        "inStock": true
    },
    {
        "id": 5,
        "title": "Mechanical Gaming Keyboard",
        "price": 75.00,
        "category": "Electronics",
        "inStock": true
    },
    {
        "id": 6,
        "title": "Organic Green Tea (50 bags)",
        "price": 12.99,
        "category": "Grocery",
        "inStock": true
    },
    {
        "id": 7,
        "title": "Leather Trifold Wallet",
        "price": 45.00,
        "category": "Apparel",
        "inStock": true
    },
    {
        "id": 8,
        "title": "Smart Fitness Watch",
        "price": 199.99,
        "category": "Electronics",
        "inStock": false
    },
    {
        "id": 9,
        "title": "Ceramic Coffee Mug",
        "price": 15.50,
        "category": "Home & Kitchen",
        "inStock": true
    },
    {
        "id": 10,
        "title": "Yoga Mat with Strap",
        "price": 32.00,
        "category": "Fitness",
        "inStock": true
    }
]


// let newProductArr = products.map((product, index) => ({ ...product, stock: 500 }))

// console.log(newProductArr);

products.forEach((product, index, array) => {
    product.price = product.price * 2;
})

console.log(products);





