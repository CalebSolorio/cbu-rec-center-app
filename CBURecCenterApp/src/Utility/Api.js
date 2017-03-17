var Api = {
    getDates(){
        var url = 'https://s3.amazonaws.com/cbu-rec-center-app/credentials/schedule.json';
        return fetch(url).then((res) => res.json());
    }
};

module.exports = Api;