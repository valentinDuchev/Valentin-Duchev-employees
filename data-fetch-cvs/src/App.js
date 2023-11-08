import './App.css';
import Papa from 'papaparse'
import { useState, useEffect } from 'react'

import moment from 'moment'



function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    console.log(data)
  }, [data])

  const currentDate = new Date()


  useEffect(() => {
    date(currentDate)
  })

  //The main function which handles the uploading and takes all data needed from the document
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    //Library which helps for reading the data from a csv file
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        let newArr = []

        if (results.data) {
          for (let result of results.data) {
            if (newArr.length !== 0) {
              for (let element of newArr) {
                //The part that handles the dates and calculates the total days worked on the project
                let dateAfter;
                if (result.DateFrom !== '' && result.DateTo !== '') {
                  const newDateFrom = new Date(result.DateFrom)
                  const newDateTo = new Date(result.DateTo)
                  const dateBefore = (Math.abs(newDateTo - newDateFrom))
                  dateAfter = Math.ceil(dateBefore / (1000 * 60 * 60 * 24));
                }
                else {
                  const newDateTo = new Date()
                  const newDateFrom = new Date(result.DateFrom)
                  const dateBefore = (Math.abs(newDateTo - newDateFrom))
                  dateAfter = Math.ceil(dateBefore / (1000 * 60 * 60 * 24));
                }

                //The part that handles the array of data coming from the csv document and makes it easier to work for the developer
                if (element.hasOwnProperty(result.ProjectId)) {
                  const currentProject = element[result.ProjectId]
                  for (let employeeElement of currentProject) {
                    if (employeeElement.hasOwnProperty(result.EmployeeId)) {
                    } else {
                      employeeElement[result.EmployeeId] = [dateAfter, result.DateFrom, result.DateTo]
                    }
                  }
                } else {
                  if (result.ProjectId !== undefined) {
                    const objToPush = { [result.EmployeeId]: [dateAfter, result.DateFrom, result.DateTo] }
                    const currentProjectId = result.ProjectId;
                    element[currentProjectId] = []
                    element[currentProjectId].push(objToPush)

                  }
                }
              }
            }
            else if (newArr.length === 0) {
              if (result.ProjectId !== undefined) {


                //Same logic for the dates, re-written, so I don't have to use global variabes or state
                let dateAfter;
                if (result.DateFrom !== '' && result.DateTo !== '') {
                  const newDateFrom = new Date(result.DateFrom)
                  const newDateTo = new Date(result.DateTo)
                  const dateBefore = (Math.abs(newDateTo - newDateFrom))
                  dateAfter = Math.ceil(dateBefore / (1000 * 60 * 60 * 24));
                }
                else {
                  const newDateTo = new Date()
                  const newDateFrom = new Date(result.DateFrom)
                  const dateBefore = (Math.abs(newDateTo - newDateFrom))
                  dateAfter = Math.ceil(dateBefore / (1000 * 60 * 60 * 24));
                }

                newArr.push({ [result.ProjectId]: [{ [result.EmployeeId]: [dateAfter, result.DateFrom, result.DateTo] }] })
              }
            }
          }

          for (let element of Object.values(newArr[0])) {
            console.log(element)
            let sum = 0;
            for (let property of Object.values(element[0])) {
              let days = (property[0])
              if (days !== NaN) {
                sum += Number(days);
              }
              console.log(sum)
            }
            const workersArray = (Object.values(element[0]))

            element.push(sum)

            //The part of the function that checks if the periods of both developers are overlapping (If they worked together or separately)

            let overlapCheckArray = []
            for (let period of Object.values(element[0])) {
              overlapCheckArray.push(period[1])
              overlapCheckArray.push(period[2]);
            }

            element[0].periods = overlapCheckArray;
            const startRange1 = element[0].periods[0]
            const startRange2 = element[0].periods[2]
            const endRange1 = element[0].periods[1]
            const endRange2 = element[0].periods[3]

            if (startRange1 < endRange2 && startRange2 < endRange2) {
              console.log("The date ranges overlap.");
            } else {
              console.log("The date ranges do not overlap.");
              console.log(element)
              console.log(newArr[0])
              element.push('Do not show')
            }
          }
          setData(newArr)
        }
      }
    })
  }


  const date = (currentDate) => {
    console.log(currentDate)
  }


  return (
    <div className="App">
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {data.length ? (
        <div>
          {Object.entries(data[0]).map(([key, val]) =>
            (val[2]) ?
              ""
              :
              key !== ""
                ?
                Object.keys(val[0]).length > 1
                  ?
                  isNaN(val[1])
                    ?

                    <h2 key={key}>Project ID: {key}
                      <br />
                      Employees Participated:  {Object.keys(val[0]).join(", ")}
                      <br />
                      <p style={{ color: 'red' }}>Please enter valid Dates!</p>
                      <br />
                    </h2>
                    :
                    <h2 key={key}>Project ID: {key}
                      <br />
                      Employees Participated:  {Object.keys(val[0]).join(", ")}
                      <br />
                      The developers have been working for <b>{(val[1])}</b> days on that project!
                      /Both of them in total, which is the period multiplied by 2/
                      <br />
                    </h2>
                  : ""
                : ""

          )}
        </div>
      ) : null}

      <p>The only projects shown here are the ones built by TWO different developers /with different ID's/ who have been working on the project at the same time. </p>
    </div>
  );
}

export default App;

