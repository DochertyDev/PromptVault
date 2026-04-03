<p align="center">
  <a href="https://dochertydev.github.io/PromptVault/">
    <img src="images/apple-touch-icon.png" width="150" alt="PromptVault">
  </a>
</p>

<div align="center">

_Click the icon above to access the app!_

</div>

<h1 align="center">
PromptVault
</h1>

<h2 align="center">A personal vault for managing, organizing, and running your AI prompts.</h2>

<div align="center">


</div>

:star: _Love PromptVault? Give us a star to help other developers discover it!_

<br />

<div align="center">
<img src="images/screenshot.png" alt="PromptVault Screenshot" width="800" style="border-radius: 16px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2); transform: perspective(1000px) rotateX(2deg); transition: transform 0.3s ease;">
</div>

***

## 📋 Table of Contents

- [Overview](#-overview)
  - [Features](#features)
- [Quick Start](#-quick-start-local-development)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
- [Usage](#️-usage)
- [Technologies Used](#️-technologies-used)
- [Security Notes](#-security-notes)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Support the Project](#-support-the-project)
- [Disclaimer](#️-disclaimer)

## 📄 Overview

PromptVault is a client-side web application designed to help users efficiently manage and organize their collection of AI prompts, creative writing snippets, code examples, or any text-based content. Built with a focus on speed and user experience, it provides a centralized and intuitive interface to store, categorize, tag, search, and retrieve your valuable prompts. All data is securely stored locally in your browser, ensuring privacy and offline accessibility.

In addition to prompt management, PromptVault supports **Workflows** — a way to bundle multiple prompts into ordered, step-by-step sequences that can be run interactively. This makes it easy to build repeatable AI processes, multi-step content pipelines, and structured prompt chains without leaving the app.

This tool is ideal for developers, writers, marketers, and anyone who frequently uses or collects text prompts and needs a robust system for personal organization without reliance on external services.

### Features

-   **Prompt Management:** Create, edit, and delete prompts with a rich markdown editor.
-   **Template Prompts:** Mark prompts as templates using `{variable}` syntax. PromptVault will detect variables and prompt you to fill them in before copying.
-   **Category Management:** Organize prompts into custom categories for structured access.
-   **Tagging System:** Apply multiple tags to prompts for flexible cross-categorization and discoverability.
-   **Favorites:** Mark important prompts as favorites for quick and easy access.
-   **Advanced Search & Filtering:** Quickly find prompts by searching keywords in title or content, filtering by category, specific tags, or favorite status.
-   **Sorting Options:** Sort prompts by creation date (newest/oldest) or alphabetically (A-Z/Z-A).
-   **Multiple View Modes:** Toggle between grid and list views for personalized browsing experience.
-   **Bulk Actions:** Select multiple prompts to delete, move, tag, export, or bundle into a workflow all at once.
-   **CSV Import & Export:** Export all prompts (or a selected subset) to CSV for backup or sharing. Import prompts from a CSV file with automatic category creation.
-   **Workflows:** Bundle prompts into named, ordered sequences. Run them step-by-step with the interactive Workflow Runner, including template variable filling per step.
-   **Workflow Import & Export:** Export individual workflows or your entire workflow collection as CSV. Re-import previously exported workflows with automatic prompt matching and creation.
-   **Client-Side Persistence:** All prompts, categories, and workflows are automatically saved in your browser using IndexedDB, ensuring data is available even after closing the application.
-   **Copy to Clipboard:** Easily copy prompt content with a single click, with visual confirmation feedback.

## 🚀 Quick Start (Local Development)

To get PromptVault up and running on your local machine, follow these steps.

### Prerequisites

-   **Git** (for cloning the repository)
-   **Node.js** (LTS version, 18.x or higher recommended)
-   **npm** (Node Package Manager, usually installed with Node.js) or Yarn

### Setup Instructions

1.  Clone the repository:

    ```sh
    git clone https://github.com/DochertyDev/PromptVault.git
    ```

2.  Navigate to the project directory:

    ```sh
    cd PromptVault
    ```

3.  Install the project dependencies:

    ```sh
    npm install
    ```

4.  Start the development server:

    ```sh
    npm run dev
    ```
    The application will typically open in your default browser at `http://localhost:5173`.

5.  Build for production (optional):

    ```sh
    npm run build
    ```
    This command compiles the application into a production-ready bundle, located in the `dist` directory.

6.  Preview production build (optional):

    ```sh
    npm run preview
    ```
    This will serve the production build locally.

7.  Deploy to GitHub Pages (optional, requires `gh-pages` configuration):

    ```sh
    npm run deploy
    ```

## ⚙️ Usage

PromptVault is designed for intuitive use. Here's a basic guide to get started:

1.  **Add New Prompts:** Click the "New" button (usually a plus icon) to open the editor. Enter your prompt's title, content (which supports markdown), select a category, and add relevant tags. Enable the **Template** toggle if your prompt contains `{variable}` placeholders.
2.  **Organize with Categories & Tags:** Use the sidebar to create and manage categories. Assign categories and tags to your prompts to keep them organized. Click on tags in the sidebar or on prompt cards to filter by them.
3.  **Search and Filter:** Use the search bar in the header to find prompts by keywords. Utilize the filter options (category, favorites, tags) to narrow down your search.
4.  **Edit and Delete:** Hover over a prompt card (or click for list view) to reveal edit (pencil icon) and delete (trash icon) options.
5.  **Copy Prompts:** Click the "Copy" button on any prompt card to quickly copy its content to your clipboard. A visual confirmation confirms the copy was successful.
6.  **Use Template Prompts:** Click the template icon on any template prompt card to open the variable fill-in modal. Enter values for each `{variable}` detected in the prompt and copy the rendered result.
7.  **Bulk Actions:** Click the checkbox on any prompt card to enter multi-select mode. Use the bulk actions bar at the bottom of the screen to delete, move, tag, export, or bundle selected prompts into a new workflow.
8.  **Import & Export Prompts:** Use the **Export** button in the toolbar to download all your prompts as a CSV. Use **Import** to load prompts from a previously exported CSV file.

### Working with Workflows

1.  **Switch to Workflows:** Click the **Workflows** tab at the top of the main content area.
2.  **Create a Workflow:** Click **New Workflow**, give it a name and optional description, and save. You can also select prompts first on the Prompts tab and click **Workflow from Selection** to pre-populate steps automatically.
3.  **Manage Steps:** Inside a workflow, use the **Add Prompts** button to add prompts from your vault as steps. Use the up/down arrow controls to reorder steps, or remove any step with the trash icon. Steps are automatically renumbered after any change.
4.  **Run a Workflow:** Click the **Run** button on any workflow card or detail view to open the Workflow Runner. Step through each prompt in sequence. Template steps will ask you to fill in variables before proceeding to the next step. Use the **Copy** button on each step to copy the rendered output — a green confirmation appears on successful copy. On the final step, click **Finish** to close the runner.
5.  **Export & Import Workflows:** Use the **Export** button on a workflow to download it as a CSV, or **Export All** to download every workflow in one file. On the Workflows list page, use the **Import** button to re-import a previously exported workflow CSV. Existing prompts are matched by title to avoid duplicates; new prompts are created automatically if step data is present.

## 🛠️ Technologies Used

-   **React:** A JavaScript library for building user interfaces.
-   **TypeScript:** A strongly typed superset of JavaScript that compiles to plain JavaScript.
-   **Vite:** A fast frontend build tool that provides a rapid development experience.
-   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
-   **Lucide React:** A collection of beautiful open-source icons.
-   **uuid:** A library for generating unique identifiers.
-   **react-markdown:** A React component to render Markdown.
-   **IndexedDB:** Browser API used for client-side data persistence, providing larger storage capacity and better performance than localStorage.

## 🔒 Security Notes

PromptVault is a purely client-side application. It does not include a backend server, user authentication, or any mechanisms for data transmission over the network.

-   **Local Data Storage:** All your prompts, categories, and workflows are stored exclusively within your browser's IndexedDB. This means your data never leaves your device and is not accessible to external servers or services.
-   **No Authentication:** Since data is stored locally, there is no user authentication system. Access to your prompts is controlled by access to your local browser profile.
-   **No External APIs:** The application does not interact with any external APIs for data storage or retrieval, further enhancing data privacy.
-   **Browser Security:** The security of your data primarily depends on the security of your web browser and operating system. Ensure your browser is up-to-date and your system is protected.

## ❓ Troubleshooting

This is a client-side, static web application with no complex dependencies or backend. Therefore, extensive troubleshooting is generally not required.

**Issue**: Prompts, categories, or workflows disappear after clearing browser data.
- **Solution**: All data is stored in IndexedDB. Clearing your browser's site data will permanently delete your saved content. There is no recovery mechanism, so regularly export your prompts and workflows using the built-in CSV export features as a backup.

**Issue**: Workflow import fails with an error about missing columns.
- **Solution**: Ensure you are using the **Import** button on the **Workflows** tab, not the prompt Import button on the Prompts tab. Workflow CSVs and prompt CSVs use different column structures and have separate import flows.

**Issue**: Application does not load correctly or shows a blank screen.
- **Solution**:
    1.  Ensure you have followed the "Setup Instructions" correctly, particularly `npm install` and `npm run dev`.
    2.  Check your browser's developer console for any error messages. These can provide clues about missing files or JavaScript errors.
    3.  Try clearing your browser's cache for the application's URL.

## 🤝 Contributing

<div align="center">
<a href="https://github.com/DochertyDev/PromptVault/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DochertyDev/PromptVault&max=400&columns=20"  width="100"/>
</a>
</div>

We welcome contributions from the community! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request. Please ensure your contributions align with the project's client-side, privacy-focused nature.

## 🌟 Support the Project

**Love PromptVault?** Give us a ⭐ on GitHub!

<div align="center">
  <p>
      <img width="800" src="https://api.star-history.com/svg?repos=DochertyDev/PromptVault&type=Date" alt="Star-history">
  </p>
</div>

## ⚠️ Disclaimer

PromptVault is a client-side application designed for personal use. All data is stored locally in your browser's IndexedDB and is not transmitted to external servers. Users are solely responsible for managing their local data, including implementing their own backup strategies for important prompts and workflows. This tool is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.