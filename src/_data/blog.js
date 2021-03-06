const Cache = require( "@11ty/eleventy-cache-assets" );
const dotenv = require( "dotenv" );
const Portway = require( "../_scripts/portway" );
const site = require( "../_data/site.json" );

/*
 * Environment variables
 */
dotenv.config();

/**
 * Fetch documents from Portway
 *
 * @return {Promise<>Object}
 */
module.exports = async () =>
{
	let requiredVarnames = [
		"PORTWAY_API_KEY",
		"PORTWAY_PROJECT_ID",
	];

	let url = site.url || process.env.URL;

	// Don't fail the build if .env vars are
	// missing. Just log a warning and return an
	// empty array instead.
	for( let varname of requiredVarnames )
	{
		if( !process.env[varname] )
		{
			console.log( `⚠️  Environment variable '${varname}' not found.` );
			return {
				name: "Eleventy Portway Starter",
				description: "A template for building a simple blog with Eleventy and Portway",
				url: url,
			};
		}
	}

	/* Posts */
	let projectId = process.env.PORTWAY_PROJECT_ID;
	let endpoint = `projects/${projectId}`;

	try
	{
		let project = await Portway.fetch(
			process.env.PORTWAY_API_KEY,
			endpoint,
			{}
		);

		if( !project.data )
		{
			throw new Error( "Unexpected response from Portway:", projectDocuments );
		}

		if( project.error )
		{
			throw new Error( `Portway returned an error when fetching project ${projectId}: '${project.error}'` );
		}

		return {
			name: project.data.name,
			description: project.data.description,
			url: url,
		};
	}
	catch( error )
	{
		console.error( error );
		return [];
	}
};
