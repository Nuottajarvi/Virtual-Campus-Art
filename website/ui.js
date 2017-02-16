var UI = {

	elements: {},
	opened: false,

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

			$("#upvote").click(function(){
				$.post("/api/models/upvote", {id: object.objectId})
				.done(function(){
					object.rating++;
				});
			});

			$("#downvote").click(function(){
				$.post("/api/models/downvote", {id: object.objectId})
				.done(function(){
					object.rating--;
				});
			});

		}.bind(this));
	},

	close: function(){
		$("#virtualCampusArtInfo").remove();
		this.opened = false;
	}
}