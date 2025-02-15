import { messages } from '../lang/en/messages.js';

class DatabaseConnector {
  constructor(Ui) {
    this.ui = Ui;
    this.sampleRows = "INSERT INTO patients (name, dateOfBirth) VALUES ('Sarah Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

    if (this.ui.sampleQueryButton) {
      this.ui.sampleQueryButton.onclick = (event) => this.handleWrite(this.sampleRows);
    }
    if (this.ui.queryButton) {
      this.ui.queryButton.onclick = this.handleSubmit.bind(this);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const query = this.ui.field.value;
    if (query.toUpperCase().startsWith('SELECT')) {
      this.handleRead(query);
    } else if (query.toUpperCase().startsWith('INSERT')) {
      this.handleWrite(query);
    } else {
      this.ui.updateFeedback(messages.badQuery, 'red');
    }
  }

  async handleRead(query) {
    // this.updateFeedback("GET: " + query, 'green');
    try {
      const endpoint = `https://clownfish-app-2i569.ondigitalocean.app/api/patients?sqlQuery=${encodeURI(query)}`;
      const response = await fetch(endpoint);
      this.ui.clearResultsTable();
      
      if (response.ok) {
        const data = await response.json();
        const result = data.result;
        console.log(result)
        if (result.errno) {
          this.ui.updateFeedback(`${messages.sqlError}\n${result.message}`, "red");
          return;
        }
        this.ui.updateFeedback(messages.successfulSelect, "green");
        this.ui.setResultsTable(result);
      } else {
        const error = result.message;
        this.ui.updateFeedback(`${messages.sqlError}\n${error}`, "red");
      }
    } catch (error) {
      this.ui.updateFeedback(messages.submitError, "red");
    }
  }

  async handleWrite(query) {
    // this.ui.updateFeedback("POST: " + query, 'green');
    try {
      // const endpoint = `https://clownfish-app-2i569.ondigitalocean.app/api/patients`;
      // const response = await fetch(endpoint);
      const response = await fetch("https://clownfish-app-2i569.ondigitalocean.app/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query })
      });
      
      if (response.ok) {
        const data = await response.json();
        const result = data.result;
        console.log(result)
        if (result.errno) {
          this.ui.updateFeedback(`${messages.sqlError}\n${result.message}`, "red");
          return;
        }
        this.ui.updateFeedback(messages.successfulInsert, "green");
        // this.ui.setResultsTable(result);
      } else {
        const error = result.message;
        this.ui.updateFeedback(`${messages.sqlError}\n${error}`, "red");
      }
    } catch (error) {
      this.ui.updateFeedback(messages.submitError, "red");
    }

    // try {
    //   let response = await fetch("https://whale-app-aoaek.ondigitalocean.app/comp4537lab4-server-2-back-end/api/definitions", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({ word, definition })
    //   });

    //   let result = await response.json();
    //   if (response.ok) {
    //     const requestNumber = result.requestNumber;
    //     this.updateFeedback(`${messages.requestNumber}${requestNumber}\n${messages.feedbackSuccess}`, "green");
    //     this.form.reset();
    //   } else {
    //     this.updateFeedback(messages.feedbackFailure, "red");
    //   }
    // } catch (error) {
    //   this.updateFeedback(messages.feedbackFailure, "red");
    // }
  }
}

class Ui {
  constructor(headingId, sampleQueryButtonId, formId, fieldLabelId, fieldId, queryButtonId, feedbackId, tableId) {
    this.heading = document.getElementById(headingId);
    this.sampleQueryButton = document.getElementById(sampleQueryButtonId);
    this.form = document.getElementById(formId);
    this.fieldLabel = document.getElementById(fieldLabelId);
    this.field = document.getElementById(fieldId);
    this.queryButton = document.getElementById(queryButtonId);
    this.feedback = document.getElementById(feedbackId);
    this.table = document.getElementById(tableId);
    this.setUserStrings();
  }

  setUserStrings() {
    this.heading.innerHTML = messages.heading;
    this.sampleQueryButton.innerHTML = messages.sampleQueryButton;
    this.fieldLabel.innerHTML = messages.fieldLabel;
    this.queryButton.innerHTML = messages.queryButton;
  }

  updateFeedback(message, color) {
    if (this.feedback) {
      this.feedback.innerText = message;
      this.feedback.style.color = color;
    }
  }

  setResultsTable(results) {
    this.clearResultsTable()
    this.table.appendChild(this.createResultsTableHead())
    results.forEach((result) => {
      this.table.appendChild(this.createResultsTableRow(result))
    })
  }

  clearResultsTable() {
    this.table.innerHTML = '';
  }

  createResultsTableHead() {
    const headRow = document.createElement('tr');
    const colNames = [messages.patientId, messages.patientName, messages.patientDateOfBirth];
    colNames.forEach((colName) => {
      const th = document.createElement('th');
      th.innerHTML = colName;
      headRow.appendChild(th);
    })
    return headRow;
  }

  createResultsTableRow(resultData) {
    const row = document.createElement('tr');
    // const colvals = [messages.patientId, messages.patientName, messages.patientDateOfBirth];
    for (let colName in resultData) {
      const td = document.createElement('td');
      td.innerHTML = resultData[colName];
      row.appendChild(td);
    }
    // colNames.forEach((colName) => {
      
    // })
    return row;
  }
}

// Initialize the DatabaseConnector class when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DatabaseConnector(
    new Ui('heading', 'sample-query-submit', 'query-form', 'query-label', 'query-field', 'query-submit', 'query-feedback', 'db-table')
  );
});
