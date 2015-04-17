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

	DATA
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

	RETURNS
		{
			"result": "success"
		}

POST /recommend/
----------------

	{
		"clusters": [
			{"name": "Radioactive", "label": 1},
			{"name": "Kitche_sink", "label": 1}
		],
		"epsilon": 10
	}



