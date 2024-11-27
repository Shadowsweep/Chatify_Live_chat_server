document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('chatify-theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.classList.add('theme-toggle');
    themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    document.body.appendChild(themeToggle);

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Update button icon
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        
        // Save theme preference
        const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('chatify-theme', newTheme);
    });
});