import React from 'react';
// import ReactDOM from 'react-dom'
// import CSVReader from 'react-csv-reader';
//import Papa from 'papaparse';
import axios from 'axios'

class CandidateSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companies: {},
      scores: [],
      candidate_id: "",
      result: '',
      //test: 1
    }
    this.toCompare = this.toCompare.bind(this);
    this.areSimilarCompany = this.areSimilarCompany.bind(this);
    this.getMyInfo = this.getMyInfo.bind(this);
    this.getScoreArray = this.getScoreArray.bind(this);
  }

  componentDidMount() {
    axios.get('/score_records').then((res) => { this.setState({ scores: res }) })
    axios.get('/companies').then((res) => { this.setState({ companies: res }) })
  }

  toCompare(res, data) {  //ultimate result that will be displayed on web page
    // let codingScore_percentile;
    // let communicationScore_percentile; 
    //the reason why no lighten up is bc fat arrow functions' arguments are brand new input instead of what i initialized.
    let my_coding_score = res['my_coding_score'];
    let my_communication_score = res['my_communication_score'];
    let sortedCommunicationScores = data[0].sort((a, b) => a - b);
    let sortedCodingScores = data[1].sort((a, b) => a - b);

    const codingScore_percentile =          //() => //1. not invoked   2.interpolate it into a string 
      Math.round((100 *
        sortedCodingScores.reduce(
          (acc, v) => acc + (v < my_coding_score ? 1 : 0) + (v === my_coding_score ? 0.5 : 0),
          0 //acc -> number of people have lower scores than me
        )) / sortedCodingScores.length);

    const communicationScore_percentile =         //() =>
      Math.round((100 *
        sortedCommunicationScores.reduce(
          (acc, v) => acc + (v < my_communication_score ? 1 : 0) + (v === my_communication_score ? 0.5 : 0),
          0
        )) / sortedCommunicationScores.length);
    //debugger
    return <div>
      <p>{`Your coding score percentile is ${codingScore_percentile}th`}</p>
      <p>{`Your communication score percentile is ${communicationScore_percentile}th.`}</p>
    </div>
  }

  areSimilarCompany(my_company_id, company2_id) {
    let my_fractal_index;
    let fractal_index2;
    let companiesData = this.state.companies.data;
    // for (let i = 0; i < companiesData.length; i++) {
    //   if (companiesData[i]['company_id'] == my_company_id) {
    //     my_fractal_index = companiesData[i]['fractal_index']
    //   }
    //   if (companiesData[i]['company_id'] == company2_id) {
    //     fractal_index2 = companiesData[i]['fractal_index']
    //   }
    // }
    let index = parseInt(my_company_id);
    my_fractal_index = companiesData[index - 1].fractal_index;
    let index2 = parseInt(company2_id);
    fractal_index2 = companiesData[index2 - 1].fractal_index
    //debugger
    return Math.abs(my_fractal_index - fractal_index2) < 0.15 ? true : false;
    //return math.floor(company1["fractal_index"] - company2["fractal_index"]) < 0.15
  }

  getScoreArray(myInformation) { //myInformation is an object
    let scores = this.state.scores.data; //the scroes here ideally is already filtered w similar companies 
    let communication_scores = [];
    let coding_scores = [];
    let dataToCompare = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i].title.localeCompare(myInformation.myTitle) === 0 && this.areSimilarCompany(myInformation.myCompanyId, scores[i].company_id)) {
        //console.log(i)
        communication_scores.push(scores[i].communication_score);
        coding_scores.push(scores[i].coding_score);
      }
    }
    dataToCompare.push(communication_scores);//0
    dataToCompare.push(coding_scores);//1
    console.log(dataToCompare)
    return dataToCompare;// an array that contain two arrays that are used to calculate percentile
  }


  getMyInfo(input_candidate_id) {
    let scores = this.state.scores.data;  //data is the key that your results come in when you use axios to make an api call
    console.log(scores)
    //console.log(typeof (parseInt(input_candidate_id)));
    let res = {}
    //debugger
    for (let i = 0; i < scores.length; i++) {
      if (parseInt(scores[i].candidate_id) == parseInt(input_candidate_id)) {
        res['myTitle'] = scores[i].title;  //got my title
        res['myCompanyId'] = scores[i].company_id  //got my comapny id
        res['my_communication_score'] = scores[i].communication_score;
        res['my_coding_score'] = scores[i].coding_score;
        break;
      }
    }
    return res;
  }

  update = (field) => {
    return (e) => {
      this.setState({ [field]: e.currentTarget.value })
    }

  }
  onSubmit = (e) => {
    e.preventDefault();
    //debugger
    const { candidate_id } = this.state;
    let myInformation = this.getMyInfo(candidate_id); //return an object contains all my info
    let data = this.getScoreArray(myInformation); //input is the above object and try to get the scores array
    let resultStr = this.toCompare(myInformation, data)
    this.setState({ result: resultStr })
    this.setState({ test: 2 })
    //console.log(data)
    //debugger
    //return result;  //won't be displayed, runs and stop as it is not in the html, not in the render function
  }

  render() {
    const { candidate_id } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <input
          type="text"
          value={candidate_id}
          onChange={this.update('candidate_id')}
        />
        <button type='submit'>Submit</button>
        {this.state.result}
        {/* <p>{this.state.test}</p> */}
      </form>
    );
  }
}

export default CandidateSearch;