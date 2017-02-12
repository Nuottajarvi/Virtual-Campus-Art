var UI = {

	elements: {},
	opened: false,

	open: function(object){
		this.close();
		$.get("ui.html", function(data){
			$("body").append(data);
			this.opened = true;

			console.log(object);
			$("#title").text(object.name);
			$("#rating").text((object.rating>0?"+":"") + object.rating);


			$("#close").click(function(){
				pointerLock(true)
			});
		}.bind(this));
	},

	close: function(){
		$("#virtualCampusArtInfo").remove();
		this.opened = false;
	}
}