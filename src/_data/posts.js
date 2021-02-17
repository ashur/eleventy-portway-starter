const Cache = require( "@11ty/eleventy-cache-assets" );
const dotenv = require( "dotenv" );
const Portway = require( "../scripts/portway" );
const Post = require( "../scripts/post" );

/*
 * Environment variables
 */
dotenv.config();

/**
 * Fetch documents from Portway
 *
 * @return {Promise<>Object[]}
 */
module.exports = async () =>
{
	let requiredVarnames = [
		"PORTWAY_KEY",
		"PORTWAY_PROJECT_ID",
	];

	// Don't fail the build if .env vars are
	// missing. Just log a warning and return an
	// empty array instead.
	for( let varname of requiredVarnames )
	{
		if( !process.env[varname] )
		{
			console.log( `⚠️ Missing required environment variable '${varname}'.` );
			return [];
		}
	}

	/* Posts */
	let projectId = process.env.PORTWAY_PROJECT_ID;
	let endpointDocuments = `projects/${projectId}/documents`;

	let urlOptions = {};
	if( process.env.PORTWAY_SHOW_DRAFTS === "true" )
	{
		console.log( "⚠️  Including drafts" );
		urlOptions.params = {
			draft: true,
		};
	};

	try
	{
		let projectDocuments = await Portway.fetch(
			process.env.PORTWAY_KEY,
			endpointDocuments,
			urlOptions
		);

		if( !projectDocuments.data )
		{
			throw new Error( "Unexpected response from Portway:", projectDocuments );
		}

		let populatedDocuments = projectDocuments.data.map( async (projectDocument) =>
		{
			let endpointPopulatedDocument = `documents/${projectDocument.id}/`;

			return Portway.fetch(
				process.env.PORTWAY_KEY,
				endpointPopulatedDocument,
				urlOptions
			);
		});

		return Promise.all( populatedDocuments )
			.then( populatedDocuments =>
			{
				return populatedDocuments
					.map( populatedDocument =>
					{
						if( !populatedDocument.data )
						{
							throw new Error( "Unexpected response from Portway:", populatedDocument );
						}
	
						return new Post( populatedDocument.data );
					})
					.sort( (docA, docB) =>
					{
						// If only one item is pinned, sort it before the unpinned item
						if( docA.data.pinned !== "true" || docB.data.pinned !== "true" )
						{
							if( docA.data.pinned === "true" )
							{
								return -1;
							}
							else if( docB.data.pinned === "true" )
							{
								return 1;
							}
						}

						// Otherwise, fall through to date-based sorting
						// (including cases where both items are pinned)
						return docB.date - docA.date;
					});
			});
	}
	catch( error )
	{
		console.error( error );
		return [];
	}
};
