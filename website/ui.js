var UI = {

	elements: {},
	opened: false,
	votedOn: {},

	open: function(object){
		this.close();
		$.get("ui.html", function(data){
			$("body").append(data);
			this.opened = true;

			$("#title").text(object.name);
			$("#rating").text((object.rating>0?"+":"") + object.rating);

			$("#close").click(function(){
				pointerLock(true)
			});
			
			if(this.votedOn[object.objectId]){
				$("#downvote").prop("disabled",true);
				$("#upvote").prop("disabled",true);
			}

			$("#upvote").click(function(){
				$.post("/api/models/upvote", {id: object.objectId})
				.done(function(){
					if(!this.votedOn[object.objectId]){
						object.rating++;
						$("#rating").text((object.rating>0?"+":"") + object.rating);
						this.votedOn[object.objectId] = true;
						$("#downvote").prop("disabled",true);
						$("#upvote").prop("disabled",true);
					}
				}.bind(this));
			}.bind(this));

			$("#downvote").click(function(){
				$.post("/api/models/downvote", {id: object.objectId})
				.done(function(){
					if(!this.votedOn[object.objectId]){
						object.rating--;
						$("#rating").text((object.rating>0?"+":"") + object.rating);
						this.votedOn[object.objectId] = true;
						$("#downvote").prop("disabled",true);
						$("#upvote").prop("disabled",true);
					}
				}.bind(this));
			}.bind(this));

		}.bind(this));
	},

	close: function(){
		$("#virtualCampusArtInfo").remove();
		this.opened = false;
	}
}