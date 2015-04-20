Api spec
========

GET /song/Song_name
-------------------
RETURNS
	
If seen before:

	{
		"_id": "1243567",
		"name": "Song_name",
		"features": [
			{
				"name": "name_of_feature",
				"value": 3.14
			},
			{
				"name": "feature_num_2",
				"value": 1337
			}
		],
		"seen": true
	}

If not seen before:

	{
		"seen": false
	}

POST /song/
-----------
DATA:

	{
		"name": "Song_name",
		"features": [
			{
				"name": "name_of_feature",
				"value": 3.14
			},
			{
				"name": "feature_num_2",
				"value": 1337
			}
		]
	}

RETURNS:

	{
		"result": "success"
	}

POST /recommend/
----------------
DATA:

	{
		"clusters": [
			{"name": "Radioactive", "label": 1},
			{"name": "Kitche_sink", "label": 1}
		],
		"epsilon": 10
	}

RETURNS

If no possible recommendations (user library encompasses database):

	{
		"result": "No possible recommendations"
	}

If no similar songs:

	{
		"result": "No similar songs"
	}

If recommendations available:

	[
	    {
	        "name": "Example_song",
	        "count": 1
	    },
	    {
	        "name": "Song_name",
	        "count": 1
	    }
    ]
