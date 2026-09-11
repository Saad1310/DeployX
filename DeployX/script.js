document.addEventListener("DOMContentLoaded", () => {

    const fileInput = document.getElementById("fileInput");
    const dropZone = document.getElementById("dropZone");
    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const removeFile = document.getElementById("removeFile");
    const deployButton = document.getElementById("deployButton");

    let selectedFile = null;

    function formatBytes(bytes) {

        if (bytes === 0) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB"];
        const index = Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

        return (
            parseFloat(
                (bytes / Math.pow(1024, index)).toFixed(2)
            ) +
            " " +
            units[index]
        );
    }

    function handleFile(file) {

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".zip")) {
            alert("Please select a ZIP file.");
            return;
        }

        selectedFile = file;

        if (fileName) {
            fileName.textContent = file.name;
        }

        if (fileSize) {
            fileSize.textContent = formatBytes(file.size);
        }

        if (fileInfo) {
            fileInfo.classList.remove("hidden");
        }

        if (dropZone) {
            dropZone.classList.add("hidden");
        }
    }

    if (fileInput) {

        fileInput.addEventListener("change", event => {
            handleFile(event.target.files[0]);
        });

    }

    if (dropZone) {

        dropZone.addEventListener("dragover", event => {

            event.preventDefault();

            dropZone.classList.add("dragging");

        });

        dropZone.addEventListener("dragleave", () => {

            dropZone.classList.remove("dragging");

        });

        dropZone.addEventListener("drop", event => {

            event.preventDefault();

            dropZone.classList.remove("dragging");

            handleFile(event.dataTransfer.files[0]);

        });
    }

    if (removeFile) {

        removeFile.addEventListener("click", () => {

            selectedFile = null;

            fileInput.value = "";

            fileInfo.classList.add("hidden");
            dropZone.classList.remove("hidden");

        });

    }

    if (deployButton) {

        deployButton.addEventListener("click", () => {

            const nameInput =
                document.getElementById("projectName");

            let projectName =
                nameInput.value.trim();

            if (!selectedFile) {

                alert("Choose a ZIP file first.");

                return;
            }

            if (!projectName) {

                projectName =
                    selectedFile.name
                        .replace(".zip", "")
                        .replace(/[^a-zA-Z0-9-_]/g, "-")
                        .toLowerCase();

            }

            startDeployment(
                selectedFile,
                projectName
            );

        });
    }

    function startDeployment(file, name) {

        const progressArea =
            document.getElementById(
                "deploymentProgress"
            );

        const progressBar =
            document.getElementById(
                "progressBar"
            );

        const progressText =
            document.getElementById(
                "progressText"
            );

        const progressPercent =
            document.getElementById(
                "progressPercent"
            );

        const logs =
            document.getElementById(
                "deployLogs"
            );

        progressArea.classList.remove("hidden");

        deployButton.disabled = true;
        deployButton.textContent = "Deploying...";

        const steps = [
            "Reading project files...",
            "Analyzing HTML structure...",
            "Checking assets...",
            "Preparing deployment...",
            "Optimizing project...",
            "Generating preview...",
            "Deployment successful."
        ];

        let progress = 0;
        let step = 0;

        const interval = setInterval(() => {

            progress += Math.floor(
                Math.random() * 12
            ) + 8;

            if (progress > 100) {
                progress = 100;
            }

            progressBar.style.width =
                progress + "%";

            progressPercent.textContent =
                progress + "%";

            if (step < steps.length) {

                logs.innerHTML +=
                    `<div>› ${steps[step]}</div>`;

                progressText.textContent =
                    steps[step];

                step++;

            }

            if (progress >= 100) {

                clearInterval(interval);

                saveDeployment(
                    name,
                    file
                );

                progressText.textContent =
                    "Deployment successful.";

                progressPercent.textContent =
                    "100%";

                setTimeout(() => {

                    window.location.href =
                        "project.html";

                }, 1000);
            }

        }, 650);
    }

    function saveDeployment(name, file) {

        const projectId =
            "dx-" +
            Date.now().toString(36);

        const deployment = {

            id: projectId,

            name: name,

            filename: file.name,

            size: file.size,

            created:
                new Date().toLocaleString(),

            url:
                `https://${name}-${projectId}.deployx.local`

        };

        localStorage.setItem(
            "deployx_current",
            JSON.stringify(deployment)
        );

        const projects =
            JSON.parse(
                localStorage.getItem(
                    "deployx_projects"
                )
            ) || [];

        projects.unshift(deployment);

        localStorage.setItem(
            "deployx_projects",
            JSON.stringify(
                projects.slice(0, 20)
            )
        );
    }

    function loadDashboard() {

        const projectList =
            document.getElementById(
                "projectList"
            );

        if (!projectList) return;

        const projects =
            JSON.parse(
                localStorage.getItem(
                    "deployx_projects"
                )
            ) || [];

        const projectCount =
            document.getElementById(
                "projectCount"
            );

        const deploymentCount =
            document.getElementById(
                "deploymentCount"
            );

        projectCount.textContent =
            projects.length;

        deploymentCount.textContent =
            projects.length;

        if (projects.length === 0) {

            projectList.innerHTML = `
                <div class="project-row">
                    <div>
                        <strong>No deployments yet</strong>
                        <span>
                            Deploy your first project to see it here.
                        </span>
                    </div>

                    <a href="deploy.html"
                       class="primary-button">
                        Deploy →
                    </a>
                </div>
            `;

            return;
        }

        projectList.innerHTML =
            projects.map(project => `

                <div class="project-row">

                    <div class="project-info">

                        <div class="project-icon">
                            ◈
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(project.name)}
                            </strong>

                            <span>
                                ${project.created}
                            </span>
                        </div>

                    </div>

                    <a
                        href="project.html"
                        class="secondary-button"
                        onclick="selectProject('${project.id}')"
                    >
                        View →
                    </a>

                </div>

            `).join("");
    }

    window.selectProject = function(id) {

        const projects =
            JSON.parse(
                localStorage.getItem(
                    "deployx_projects"
                )
            ) || [];

        const project =
            projects.find(
                item => item.id === id
            );

        if (project) {

            localStorage.setItem(
                "deployx_current",
                JSON.stringify(project)
            );
        }
    };

    function loadProjectPage() {

        const title =
            document.getElementById(
                "projectTitle"
            );

        if (!title) return;

        const project =
            JSON.parse(
                localStorage.getItem(
                    "deployx_current"
                )
            );

        if (!project) {

            title.textContent =
                "No project found";

            return;
        }

        document.title =
            `${project.name} — DeployX`;

        title.textContent =
            project.name;

        const url =
            document.getElementById(
                "projectUrl"
            );

        url.textContent =
            project.url;

        /*
            Since this is a frontend-only build,
            we cannot permanently host the ZIP.
            Instead we generate a local preview
            demonstration.
        */

        const preview =
            document.getElementById(
                "previewFrame"
            );

        const previewButton =
            document.getElementById(
                "previewButton"
            );

        const demoHTML = `

            <!DOCTYPE html>

            <html>

            <head>

                <style>

                    body {

                        margin:0;

                        min-height:100vh;

                        display:grid;

                        place-items:center;

                        font-family:Arial;

                        background:
                        linear-gradient(
                            135deg,
                            #080b18,
                            #141027
                        );

                        color:white;

                        text-align:center;

                    }

                    .box {

                        padding:50px;

                        border:
                        1px solid
                        rgba(255,255,255,.1);

                        border-radius:25px;

                        background:
                        rgba(255,255,255,.05);

                    }

                    h1 {

                        font-size:45px;

                    }

                    span {

                        color:#8c8fff;

                    }

                </style>

            </head>

            <body>

                <div class="box">

                    <h1>
                        ${escapeHTML(project.name)}
                    </h1>

                    <p>
                        <span>✓</span>
                        Your DeployX preview is live.
                    </p>

                    <small>
                        Deployment ID:
                        ${project.id}
                    </small>

                </div>

            </body>

            </html>
        `;

        const blob =
            new Blob(
                [demoHTML],
                { type: "text/html" }
            );

        const previewURL =
            URL.createObjectURL(blob);

        preview.src =
            previewURL;

        previewButton.href =
            previewURL;

        const deleteButton =
            document.getElementById(
                "deleteProject"
            );

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    const projects =
                        JSON.parse(
                            localStorage.getItem(
                                "deployx_projects"
                            )
                        ) || [];

                    const remaining =
                        projects.filter(
                            p =>
                                p.id !==
                                project.id
                        );

                    localStorage.setItem(
                        "deployx_projects",
                        JSON.stringify(
                            remaining
                        )
                    );

                    localStorage.removeItem(
                        "deployx_current"
                    );

                    window.location.href =
                        "dashboard.html";
                }
            );
        }
    }

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadDashboard();
    loadProjectPage();

});