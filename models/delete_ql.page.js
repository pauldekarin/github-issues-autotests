const axios = require('axios');
const { clear } = require('console');
const dotenv = require('dotenv')
dotenv.config({path:'env'});

let data_queury = JSON.stringify({
  query: `{
    repository(owner:"${process.env.GITHUB_USERNAME}" name:"${process.env.GITHUB_REPOSITORY}"){
        issues(last:100){
            nodes{
                ... on Issue{
                    id
                    number
                }
            }
        }
    }
}`
});

const form_data_mutation = id => 
JSON.stringify({query:`mutation{
        deleteIssue(input:{issueId:"${id}"}){
            clientMutationId
    }
}`})

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.github.com/graphql',
  headers: { 
    'Authorization': `Bearer ${process.env.GITHUB_API_TOKEN}`, 
    'Content-Type': 'application/json'
  },
};

async function request_to_delete(node){
    config.data = form_data_mutation(node.id);
    await axios.request(config)
    .then(response => {
        if(response.status == 200){
            console.log(`[GraphQL] Deleting  ${node.number} -- Successfully`);
        }else{
            console.log(`[GraphQL] Deleting  ${node.number} -- Failed`);
        }
    }).catch(error => {
        console.log(error);
    });
}

async function get_issues(){
    let nodes = new Array();
    config.data = data_queury;
    await axios.request(config)
    .then(async (response) => {
        nodes = response.data.data.repository.issues.nodes;
    }).catch(error => {

    })
    return nodes;
}

async function clear_all_issues(){
    let nodes = await get_issues();
    nodes.map(async (node) => {
        await request_to_delete(node);
    })
}

exports.delete_issue_graphql = async function delete_issue_graphql(issue_number){
    let nodes = await get_issues();
    for(let i = 0; i < nodes.length; i++){
        if(nodes.at(i).number == issue_number){
            await request_to_delete(nodes.at(i));
            break;
        }
    }
}

