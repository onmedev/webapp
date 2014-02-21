var session = 
{
	authenticate: function(){
			console.log('trying login');
			
			$.ajax({
				url: "/user",
				method: "GET",
				dataType: "json",
				data:{ email : $('#femail').val(), password:$('#fpass').val() },
				success: function(data, text, xhr){
					if(data.apitoken)
					{
						session.userfields = data; 
						localStorage.token = data.apitoken;
						session.login();
					}
					else
					{
						$('.alert').slideDown();
						$('#amessage').html("Authentication Error");
					}
				},
				error : function()
				{
					{
						$('.alert').slideDown();
						$('#amessage').html("Bad Credentials");
						
					}
				}
			});
		},
		
	login: function(){
		$('.alert').hide();
		if(localStorage.token == '' || localStorage.token == null)
		{
			$('#navlogout').hide();
			$('.hsearch').hide();
			$('.hlogin').fadeIn();
			$(".wsearch").hide();
			
			
			
		}		
		else //authentication check!
		{
			console.log('trying token login. if bad, kill token');
			
						$.ajax({
					url: "/user",
					method: "GET",
					dataType: "json",
					data:{ token : localStorage.token },
					success: function(data, text, xhr){
						if(data)
						{
							
							
						}
						else
						{
							localStorage.token = '';
							document.location="./";
						}
					},
					error : function()
					{
						{
							localStorage.token = '';
							document.location="./";
							
						}
					}
				});
			
			
			
			
			$('.hlogin').hide();
			$('.hsearch').fadeIn();
			$('#navlogout').fadeIn();
			$(".wsearch").fadeIn();
			
		}
	},
	
	logout: function(){
		localStorage.token = '';
		document.location="./";
	},
	
	userfields : ""
	
	
};

var apisearch = {
	user : function()
	{
		
		$('#usersearch').html("");
		$("#loadingu").slideDown();
		
		$.ajax({
		url: "/user",
		method: "GET",
		dataType: "json",
		data:{ token : localStorage.token, search: $('#osearch').val() },
		success: function(data, text, xhr){
			
			$("#loadingu").slideUp();
			slam = '<div class="list-group" style="text-align:left;">';
			
			if(Object.keys(data).length == 0)
				slam += "No records found.";
			for (tuser in data[0])
			{
				tuser = data[0][tuser];
				slam += '<a onclick="modal.editUser('+tuser.id+');" data-toggle="modal" data-target="#myModal" href="#" class="list-group-item">['+tuser.id+'] nickname='+tuser.nickname + ' email=' + tuser.email+'</a>';		
			}
			slam += '</div';
			
			$('#usersearch').html(slam);
			
			
			
		},
		error : function()
		{
			{
				$('.alert').slideDown();
				$("#loadingu").slideUp();
				$('#amessage').html("Search Error");
				
			}
		}
		});
	},
	
	place : function()
	{
		
		$('#placesearch').html("");
		$("#loadingp").slideDown();
		
		$.ajax({
		url: "/place",
		method: "GET",
		dataType: "json",
		data:{ token : localStorage.token, search: $('#osearch').val() },
		success: function(data, text, xhr){
		
			$("#loadingp").slideUp();
			
			slam = '<div class="list-group" style="text-align:left;">';
			
			if(Object.keys(data).length == 0)
				slam += "No records found.";
			for (tplace in data[0])
			{
				tplace = data[0][tplace];
				slam += '<a onclick="modal.editPlace('+tplace.id+');" data-toggle="modal" data-target="#myModal" href="#" class="list-group-item">['+tplace.id+'] name='+tplace.name + ' zip=' + tplace.zip + ' phone=' + tplace.phone+'</a>';		
			}
			slam += '</div';
			
			$('#placesearch').html(slam);
			
			
			
		},
		error : function()
		{
			{
				$('.alert').slideDown();
				$("#loadingp").slideUp();
				$('#amessage').html("Search Error");
				
			}
		}
		});
	}

};



var modal = {
	addUser : function(){
		modal.waitforit();
		$("#myModalLabel").html("Add User");
		
		fields = new Array("email", "nickname", "password");
		
		//userfields = Object.keys(session.userfields);
		slam = "<div> <form class='form-inline' id='adduserform'>";
		for (tfield in fields)
		{
			slam += "<label style='width: 200px;'><strong>"+ fields[tfield] + "</strong></label>  <input type='text' class='input-mini' name='"+ fields[tfield] + "'><br/>";
     
			
		}
		slam += "</form></div>";
		
		$("#modalcontent").html(slam);
		
		$("#mbsave").off('click')
		$("#mbsave").html("Save and Go");
		$("#mbsave").click( function(ev){ 
			$.post('/user', $('#adduserform').serialize(), function(data, status)
			{
				if(data[0])
				{
					$('.alert').slideDown();
					$('#amessage').html("New User Added!");
				}
				else
				{
					$('.alert').slideDown();
					$('#amessage').html(JSON.stringify(data));
				}
			})} );
	},
	
	editUser : function(tid){

		modal.waitforit();
		
		if(tid == undefined)
			tid = prompt("ID?", '');
		
		if(tid == null || tid == '')
			return;
			
		$('#myModal').modal('show');
		
		$.get("/user?token="+localStorage.token+"&id="+tid, function(data, status)
		{
			slam = "<div> <form class='form-inline' id='edituserform'>";
			data.token = data.apitoken;
			fields = Object.keys(data);
			for (tfield in fields)
			{
				trow = fields[tfield];
				tdata = data[trow];
				if(tdata == null)
					tdata = "";
					
				tdisabled = "";	
				if(trow == "id" || trow == "created" || trow == "modified" || trow == "token" || trow == "apitoken" || trow == "salt" || trow == "passhash" || trow == "active" )
					tdisabled = "readonly";
				slam += "<label style='width: 200px;'><strong>"+ trow + "</strong></label>  <input size=40 "+tdisabled+" type='text' class='input-mini' name='"+ trow + "' value='"+escapehtml(tdata)+"'><br/>";
		 
				
			}
			slam += "</form></div>";
			$("#modalcontent").html(slam);
			
			$("#mbsave").off('click')
			$("#mbsave").html("Apply");
			$("#mbsave").click( function(ev){ 
			
				$.ajax({
				url : '/user', 
				type : 'PUT',
				data : $('#edituserform').serialize(), 
				success: function(data, status)
				{
					if(data[0])
					{
						$('.alert').slideDown();
						$('#amessage').html("User Edited!");
					}
					else
					{
						$('.alert').slideDown();
						$('#amessage').html(JSON.stringify(data));
					}
				}
				
				});
			
			});
		});		
		
		
		$("#myModalLabel").html("Edit User");
		
	},
	
	addPlace : function(){
		modal.waitforit();
		$("#myModalLabel").html("Add Place");
		
		fields = new Array("name");
		
		//userfields = Object.keys(session.userfields);
		slam = "<div> <form class='form-inline' id='addplaceform'>";
		for (tfield in fields)
		{
			slam += "<label style='width: 200px;'><strong>"+ fields[tfield] + "</strong></label>  <input type='text' class='input-mini' name='"+ fields[tfield] + "'><br/>";
     
			
		}
		slam += "</form></div>";
		
		$("#modalcontent").html(slam);
		
		$("#mbsave").off('click')
		$("#mbsave").html("Save and Go");
		$("#mbsave").click( function(ev){ 
			$.post('/place?token='+localStorage.token, $('#addplaceform').serialize(), function(data, status)
			{
				if(data[0].id)
				{
					$('.alert').slideDown();
					$('#amessage').html("New Place Added!");
				}
				else
				{
					$('.alert').slideDown();
					$('#amessage').html(JSON.stringify(data));
				}
			})} );
	},
	
	editPlace : function(tid){
		modal.waitforit();
		
		if(tid == undefined)
			tid = prompt("ID?");
			
		if(tid == null || tid == '')
			return;
			
		$('#myModal').modal('show');
		
		$.get("/place?token="+localStorage.token+"&id="+tid, function(data, status)
		{
			slam = "<div> <form class='form-inline' id='editplaceform'>";
			delete data[0].STATUS;
			fields = Object.keys(data[0]);
			for (tfield in fields)
			{
				trow = fields[tfield];
				tdata = data[0][trow];
				if(tdata == null)
					tdata = "";
					
				tdisabled = "";
				if(trow == "id" || trow == "created" || trow == "modified")
					tdisabled = "readonly";	
				
				slam += "<label style='width: 200px;'><strong>"+ trow + "</strong></label>  <input size=40 "+tdisabled+" type='text' class='input-mini' name='"+ trow + "' value='"+escapehtml(tdata)+"'><br/>";
		 
				
			}
			slam += "</form></div>";
			$("#modalcontent").html(slam);
			
			$("#mbsave").off('click')
			$("#mbsave").html("Apply");
			$("#mbsave").click( function(ev){ 
			
				$.ajax({
				url : '/place?token='+localStorage.token, 
				type : 'PUT',
				data : $('#editplaceform').serialize(), 
				success: function(data, status)
				{
					if(data.id)
					{
						$('.alert').slideDown();
						$('#amessage').html("Place Edited!");
					}
					else
					{
						$('.alert').slideDown();
						$('#amessage').html(JSON.stringify(data));
					}
				}
				
				});
			
			});
		});		
		
		
		
		$("#myModalLabel").html("Edit Place");

	
		
	},
	
	waitforit : function()
	{
		$("#modalcontent").html("loading...");
	},
	
	clear : function()
	{
		$("#modalcontent").html("");
	}
};


$(document).ready(function(){
	$('.alert').hide();
	$("#loadingu").hide();
	$("#loadingp").hide();
	$(".wsearch").hide();
	
	session.login();
});

function escapehtml(unsafe) {
	unsafe = unsafe + "";
    unsafe = unsafe.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
	return unsafe;
       
}