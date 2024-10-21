# FE2 Audio Uploader

This project is an **open-source tool** designed for users who want to upload custom audio for **Flood Escape 2** (FE2) maps. It provides a smooth and user-friendly interface for uploading `.mp3` and `.ogg` files, and it comes with a list page to view all previously uploaded files.

## Features

- **Audio Uploader**: Upload `.mp3` or `.ogg` files to use in your FE2 maps.
- **List Page**: View a list of all your uploaded audio files, with direct links to each file.
- **Discord Integration**: Log in with your Discord account to track your uploads.
- **Open Source**: This project is open source, meaning you can clone, modify, or contribute to it.

## Live Version

While the project is open-source, the live version of this uploader can be accessed by anyone at:

- **FE2 Audio Uploader**: <https://fe2.jaylen.nyc/>  
- **List Page**: <https://fe2.jaylen.nyc/list>

> **Note**: You will need to log in with your Discord account to use the uploader and view your files.

## How It Works

### 1. Audio Uploader

- Once logged in via Discord, users can upload `.mp3` or `.ogg` files.
- Upon successful upload, the file will be stored, and a direct link will be provided for use in FE2 maps.

### 2. List Page

- The list page allows you to see all the audio files you've uploaded, complete with direct links for easy access.
- The list is tied to your Discord account, so only you can see the files you've uploaded.

## Open-Source Contributions

Contributions are welcome! If you would like to contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

### Prerequisites

Before setting up the project locally, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/jvqze/fe2.jaylen.nyc.git
    ```

2. Navigate to the project directory:

    ```bash
    cd fe2.jaylen.nyc
    ```

3. Install the dependencies:

    ```bash
    yarn install
    ```

    or

    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory, and add the required environment variables:

    ```
    DISCORD_CLIENT_ID=your-discord-client-id
    DISCORD_CLIENT_SECRET=your-discord-client-secret
    MONGODB_URI=mongodb-uri
    TIXTE_API_KEY=api-key-for-tixte
    NEXTAUTH_SECRET=your-next-auth-secret
    ```

5. Start the development server:

    ```bash
    yarn dev
    ```

    or

    ```bash
    npm run dev
    ```

6. Open your browser and navigate to `http://localhost:3000` to see the project in action.

## Technologies Used

- **Next.js**: React framework for building server-side rendering and static web applications.
- **Tailwind CSS**: A utility-first CSS framework for designing the frontend.
- **Framer Motion**: A React animation library.
- **NextAuth.js**: Authentication for Next.js.
- **MongoDB**: Used for storing uploaded file information.
- **Discord OAuth**: Used for logging in and tracking user uploads.
- [**Tixte**](https://tixte.com): Used to store files of users uploads!

## Contact

If you have any questions or feedback, feel free to reach out:

- Discord: [jvqze](https://discord.com/users/1203092268672753785)
- GitHub: [jvqze](https://github.com/jvqze)

---

Feel free to clone the repo, explore the code, and contribute to making it better!
