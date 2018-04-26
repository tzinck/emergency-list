import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      phone: '',
      contactName: '',
      contactPhone: '',
      userMessage: ''
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Emergency Contact List</h2>
        </div>
        <InputField />
        <SearchList />
      </div>
    );
  }
}

class Employee extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.name,
      phone: this.props.phone,
      contact: this.props.contact,
      contactPhone: this.props.contactPhone,
    }
  }

  render() {

    return (
      <li className="employee-element">
        <span className="employee">{this.state.name}</span>
        <span className="phone">{this.state.phone}</span>
        <br/>
        <form onSubmit={this.onSubmit}>
          <input type="text" className="contact" name="contact" value={this.state.contact} onChange={this.onChange}></input>
          <input type="text" className="phone" name="contactPhone" value={this.state.contactPhone} onChange={this.onChange}></input>
          <button className="save-edit-button">Save</button>
        </form>
      </li>
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.name,
      phone: nextProps.phone,
      contact: nextProps.contact,
      contactPhone: nextProps.contactPhone
    })
  }

  onSubmit = (event) => {
    event.preventDefault();

    this.state.contactPhone = this.state.contactPhone.replace(/\D/g,'')

    if (!this.state.name || !this.state.phone || !this.state.contact || !this.state.contactPhone) {
      this.setState({
        contact: this.props.contact
      })
      return;
    }

    if (this.state.phone.length < 4 || this.state.contactPhone.length < 4) {
      this.setState({
        contactPhone: this.props.contactPhone
      })
      return;
    }

    fetch('http://localhost:8080/api/edit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: this.state.name,
        Phone: this.state.phone,
        Contact: this.state.contact,
        ContactPhone: this.state.contactPhone
      })
    }).then(
      (result) => {
      },
      (error) => {
      }
    )
  }

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }
}

class SearchList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isLoaded: false,
      employees: [],
      displayedEmployees: []
    };
  }

  componentDidMount() {
    fetch("http://localhost:8080/api/list")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            employees: result,
            displayedEmployees: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
          });
        }
      )
  }

  searchHandler = (event) => {
    let queryString = event.target.value.toLowerCase(),
    displayedEmployees = this.state.employees.filter((element) => {
      let queryValue = element.name.toLowerCase();
      return queryValue.indexOf(queryString) !== -1;
    });

    this.setState({
      displayedEmployees: displayedEmployees
    });
  }

  render() {
    return (
      <div>
        <input type="text" placeholder="Search by employee name..." onChange={this.searchHandler.bind(this)}/>
        <p>
          *Note* to delete an entry, blank both contact fields, and hit 'Save'
        </p>
        <ul className="employee-list">
          {
            this.state.displayedEmployees.map((element, index) => {
              return <Employee key={index}
                                name={element.name}
                                phone={element.phone}
                                contact={element.contact}
                                contactPhone={element.contactPhone}
                      />
            })
          }
        </ul>
      </div>
    );
  }
}

class InputField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      phone: '',
      contact: '',
      contactPhone: '',
      userMessage: 'Must enter all fields to submit'
    }
  }

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  onSubmit = (event) => {
    event.preventDefault();

    this.state.phone = this.state.phone.replace(/\D/g,'');
    this.state.contactPhone = this.state.contactPhone.replace(/\D/g,'')

    if (!this.state.name || !this.state.phone || !this.state.contact || !this.state.contactPhone) {
      this.setState({
        userMessage: 'Error submitting form, must provide all fields'
      });
      return;
    }

    if (this.state.phone.length < 4 || this.state.contactPhone.length < 4) {
      this.setState({
        userMessage: 'Error submitting form, must provide valid phone number'
      });
      return;
    }

    fetch('http://localhost:8080/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        Name: this.state.name,
        Phone: this.state.phone,
        Contact: this.state.contact,
        ContactPhone: this.state.contactPhone
      })
    }).then(
        (result) => {
          this.setState({
            name: '',
            phone: '',
            contact: '',
            contactPhone: '',
            userMessage: 'Must enter all fields to submit'
          })
        },
        (error) => {
          this.setState({
            userMessage: 'Error Submitting'
          })
        }
      )
  }

  render() {
    return (
      <div>
        <h3>Add a new emergency contact</h3>
        <div className="Employee-submit">
          <form onSubmit={this.onSubmit}>
            <p>
              <label>Employee Name:</label>
              <input value={this.state.name} name="name" onChange={this.onChange} />
            </p>
            <p>
              <label>Employee Phone Number:</label>
              <input value={this.state.phone} name="phone" onChange={this.onChange} />
            </p>
            <p>
              <label>Emergency Contact Name:</label>
              <input value={this.state.contact} name="contact" onChange={this.onChange} />
            </p>
            <p>
              <label>Emergency Contact Phone Number:</label>
              <input value={this.state.contactPhone} name="contactPhone" onChange={this.onChange} />
            </p>
            <button>Submit</button>
          </form>
        </div>
        <div className="User-message">
          <p>
            {this.state.userMessage}
          </p>
        </div>
    </div>
    )
  }
}

export default App;
