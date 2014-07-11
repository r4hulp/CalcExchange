/**
 * Created by rahul.patil on 07-Jul-14.
 */

CalcExchange = {} || CalcExchange;

CalcExchange.Models = {};

CalcExchange.Models.ReputationItem = function(data){
    var self = this;
    self.on_date = ko.observable(Date.create(data.on_date * 1000).short());
    self.post_id = ko.observable(data.post_id);
    self.post_type = ko.observable(data.post_type);
    self.reputation_change =  ko.observable(data.reputation_change === undefined ? 0 : data.reputation_change);
    self.user_id = ko.observable(data.user_id)
    self.vote_type = ko.observable(data.vote_type);
};



CalcExchange.Service = (function(){
    var self = this;
    self.getUserReputation = function(url){
        return $.get(url); // returns a promise
    };

    return {
        getUserReputation:getUserReputation
    }
})(CalcExchange);


CalcExchange.App = function(){
    //Private
    var self = this;

    self.UserProfile = ko.observable("");
    self.apiUrl = "http://api.stackexchange.com/2.2/"; //API 2.2 url;
    self.SiteName = ko.observable("stackoverflow");
    self.FromDate = ko.observable(new Date());
    self.ToDate = ko.observable(new Date());
    self.Username = ko.observable("");
    self.UsernameObj = ko.observable("");
    self.Sites = ko.observableArray();
    self.ReputationTimeline = ko.observableArray();



    self.TotalPoints = ko.observable();

    self.Uri = ko.observable();

    self.UserProfile.subscribe(function(user){
        console.log(user);
        self.Username(user.user_id);
        self.Uri(self.GenerateUri());
    });


    self.SiteName.subscribe(function(){
        console.log("Sites");
       self.UsernameObj("");
    });
    self.GenerateUri = function(){
        uri = "http://api.stackexchange.com/2.2/users/"+self.Username()+"/reputation?pagesize=100&fromdate="+Math.floor(new Date(self.FromDate()).getTime() / 1000)+"&todate="+Math.floor(new Date(self.ToDate()).getTime() / 1000)+"&site=" + self.SiteName();
        return uri;
    }

    self.FromDate.subscribe(function(item){
        console.log(item);
    });

    self.SitesCompute = ko.computed(function(){
        var siteCollection;
        var sites = $.get("http://api.stackexchange.com/2.2/sites?filter=!*L6TgyCNXHmkzktK&pagesize=400", function(result){
            var siteArray = _.sortBy(result.items, "api_site_parameter");
            self.Sites(siteArray);
        });
        return true;
    });

    self.DateComputer = ko.computed(function(){
        var newDate = self.FromDate();
        var toDate = self.ToDate();
        self.Uri(self.GenerateUri());
    });


    self.ComputePoints = ko.observableArray();

    self.Uri.subscribe(function(){
        console.log("Uri Subscription");
        if(self.Username() != null && self.Username() != ""){
        var totalPoints = 0;
            var promise = CalcExchange.Service.getUserReputation(self.Uri());
            promise.success(function(data){
//                self.ReputationTimeline(data.items);
                self.ReputationTimeline.removeAll();
                ko.utils.arrayForEach(data.items, function(item){
                    var number = item.reputation_change === undefined ? 0 : item.reputation_change;
                    self.ReputationTimeline.push(new CalcExchange.Models.ReputationItem(item))
                    totalPoints += number;
                });
                console.log(self.ReputationTimeline());
                self.TotalPoints(totalPoints);
            });
        }
    });

    self.getUsers = function(searchTerm, callback) {
        console.log(callback);
        $.ajax({
            dataType: "json",
            url: self.apiUrl + "users",
            data: {
                inname: searchTerm,
                site: self.SiteName()
            }
        }).done(function(data){

            callback(data.items);
        });
    };
};

$(function(){
    ko.applyBindings(new CalcExchange.App());
});
