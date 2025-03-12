// Function to load sample queries from the backend
function loadSampleQueries() {
  fetch('/api/queries')
    .then(response => response.json())
    .then(data => {
      if(data.status === 'success'){
        populateSampleQueries(data.queries);
      } else {
        console.error("Error loading queries:", data.message);
      }
    })
    .catch(err => console.error("Fetch error:", err));
}

function populateSampleQueries(queries) {
  const tableBody = document.getElementById('sample-queries-table');
  tableBody.innerHTML = ''; // clear any existing content

  queries.forEach((query) => {
    const tr = document.createElement('tr');
    tr.classList.add('sample-query');
    tr.dataset.sql = query.sql;
    if(query.table) {
      tr.dataset.table = query.table;
    }
    
    // Title cell for executing or redirecting
    const titleCell = document.createElement('td');
    titleCell.textContent = query.title;
    titleCell.classList.add('query-title');
    tr.appendChild(titleCell);
    
    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.classList.add('query-actions');
    
    // Add button container for better styling
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    
    // Create "Add to Editor" button
    const addToEditorBtn = document.createElement('button');
    addToEditorBtn.textContent = "Add to Editor";
    addToEditorBtn.classList.add('action-btn', 'add-to-editor-btn');
    buttonContainer.appendChild(addToEditorBtn);
    
    // Create "Run" button
    const runBtn = document.createElement('button');
    runBtn.textContent = "Run";
    runBtn.classList.add('action-btn', 'run-btn');
    buttonContainer.appendChild(runBtn);
    
    // Create "Delete" button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add('action-btn', 'delete-btn');
    buttonContainer.appendChild(deleteBtn);
    
    actionsCell.appendChild(buttonContainer);
    tr.appendChild(actionsCell);
    
    // SQL cell with a toggle button to show/hide the SQL text
    const sqlCell = document.createElement('td');
    const toggleButton = document.createElement('button');
    toggleButton.textContent = "Show SQL";
    toggleButton.classList.add('toggle-sql');
    sqlCell.appendChild(toggleButton);
    
    const sqlDiv = document.createElement('div');
    sqlDiv.classList.add('sql-text');
    sqlDiv.style.display = "none";
    sqlDiv.textContent = query.sql;
    sqlCell.appendChild(sqlDiv);
    
    tr.appendChild(sqlCell);
    tableBody.appendChild(tr);
    
    // Title cell click: if query has a table, redirect; otherwise, load and run.
    titleCell.addEventListener('click', function(){
      if(query.table) {
        window.location.href = '/table/' + query.table;
      } else {
        document.querySelector('textarea[name="query"]').value = query.sql;
        document.getElementById('query-form').dispatchEvent(new Event('submit'));
      }
    });
    
    // Add to Editor button click: just populate the query textarea
    addToEditorBtn.addEventListener('click', function(e){
      e.stopPropagation();
      document.querySelector('textarea[name="query"]').value = query.sql;
      // Scroll to the query editor
      document.querySelector('textarea[name="query"]').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Run button click: populate the textarea and run the query
    runBtn.addEventListener('click', function(e){
      e.stopPropagation();
      document.querySelector('textarea[name="query"]').value = query.sql;
      
      // Run the query and display results inline
      runQueryInline(query.sql);
    });
    
    // Delete button click: show confirmation dialog and delete if confirmed
    deleteBtn.addEventListener('click', function(e){
      e.stopPropagation();
      if(confirm(`Are you sure you want to delete the query "${query.title}"?`)) {
        deleteQuery(query.title);
      }
    });
    
    // Toggle button click: show/hide SQL text.
    toggleButton.addEventListener('click', function(e){
      e.stopPropagation();
      if(sqlDiv.style.display === "none") {
        sqlDiv.style.display = "block";
        toggleButton.textContent = "Hide SQL";
      } else {
        sqlDiv.style.display = "none";
        toggleButton.textContent = "Show SQL";
      }
    });
  });
}

// Function to run a query and display results inline
function runQueryInline(query) {
  var formData = new FormData();
  formData.append('query', query);

  fetch('/query', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    var resultDiv = document.getElementById('query-result');
    if(data.status === 'success'){
      if(data.data){
        let html = '<table><thead><tr>';
        data.columns.forEach(function(col){
          html += '<th>' + col + '</th>';
        });
        html += '</tr></thead><tbody>';
        data.data.forEach(function(row){
          html += '<tr>';
          data.columns.forEach(function(col){
            html += '<td>' + row[col] + '</td>';
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        resultDiv.innerHTML = html;
      } else {
        resultDiv.innerHTML = '<p>' + data.message + '</p>';
      }
    } else {
      resultDiv.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
    }
    
    // Scroll to the results
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  })
  .catch(err => {
    console.error(err);
    document.getElementById('query-result').innerHTML = '<p class="error">Error executing query.</p>';
  });
}

// Function to delete a query
function deleteQuery(title) {
  fetch(`/api/queries/${encodeURIComponent(title)}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if(data.status === 'success'){
      loadSampleQueries();  // Refresh the sample queries panel
    } else {
      alert("Error deleting query: " + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error deleting query.");
  });
}

// Handle new query form submission
document.getElementById('new-query-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const newQuery = {
    title: form.title.value.trim(),
    sql: form.sql.value.trim(),
    table: form.table.value.trim() || null
  };

  fetch('/api/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newQuery)
  })
  .then(response => response.json())
  .then(data => {
    const resultDiv = document.getElementById('new-query-result');
    if(data.status === 'success'){
      resultDiv.textContent = data.message;
      form.reset();
      loadSampleQueries();  // Refresh the sample queries panel
    } else {
      resultDiv.textContent = "Error: " + data.message;
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById('new-query-result').textContent = "Error saving query.";
  });
});

// Existing query form handler
document.getElementById('query-form').addEventListener('submit', function(e){
  e.preventDefault();
  var query = this.query.value;
  var formData = new FormData();
  formData.append('query', query);

  fetch('/query', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    var resultDiv = document.getElementById('query-result');
    if(data.status === 'success'){
      if(data.data){
        let html = '<table><thead><tr>';
        data.columns.forEach(function(col){
          html += '<th>' + col + '</th>';
        });
        html += '</tr></thead><tbody>';
        data.data.forEach(function(row){
          html += '<tr>';
          data.columns.forEach(function(col){
            html += '<td>' + row[col] + '</td>';
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        resultDiv.innerHTML = html;
      } else {
        resultDiv.innerHTML = '<p>' + data.message + '</p>';
      }
    } else {
      resultDiv.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
    }
  })
  .catch(err => {
    console.error(err);
  });
});

// Fetch and display table list
function fetchTables() {
  fetch('/get_tables')
    .then(response => response.json())
    .then(data => {
      console.log("Tables fetched:", data);  // Debug: log table names
      let tableList = document.getElementById("tableList");
      tableList.innerHTML = "";  // Clear any existing items

      data.forEach(table => {
        let tableItem = document.createElement("li");
        tableItem.innerText = table;
        tableItem.style.cursor = "pointer";
        // When clicked, fetch the schema for that table
        tableItem.addEventListener("click", () => fetchSchema(table));
        tableList.appendChild(tableItem);
      });
    })
    .catch(err => console.error("Error fetching tables:", err));
}

// Fetch and display schema for a given table
function fetchSchema(tableName) {
  console.log("Fetching schema for:", tableName);  // Debug log
  fetch(`/get_schema/${tableName}`)
    .then(response => response.json())
    .then(data => {
      console.log("Schema data received:", data);  // Debug: log schema
      let schemaText = data.map(col => 
        `${col.name} (${col.type})${col.pk ? " [PK]" : ""}`
      ).join("\n");

      document.getElementById("schemaDisplay").innerText = schemaText;
    })
    .catch(err => {
      console.error("Error fetching schema:", err);
      document.getElementById("schemaDisplay").innerText = "Error fetching schema.";
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  loadSampleQueries();
  fetchTables();
});