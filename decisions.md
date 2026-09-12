# Technical Decisions

### 1. React Server Components for Data Fetching

We stopped using React hooks to load data in the browser. Instead, we now load all the appointments and schedules directly on the server before the page even opens. This makes the app load instantly for the user and removes those annoying loading spinners.

### 2. Next.js 16 Edge Proxy for Authentication

We added a special security file that checks if a user is logged in before they can even reach a page. This stops normal patients from sneaking into the staff dashboard. It keeps our app very secure without making the page code messy.

### 3. Server Actions for Form Mutations

We moved all the saving and booking logic to the backend server. This lets us check if a time slot is already taken before saving it, which stops two people from booking the same doctor at once. It also lets us refresh the screen automatically as soon as new data is saved.

### 4. Why We Didn't Use Local Storage

We avoided local storage because Next.js builds our pages on the server, which cannot see the browser's local storage at all. If we stored login tokens there, the server would have no idea who the user is when trying to build a secure page. Instead, we used secure cookies because they are automatically sent to the server on every single page load.
