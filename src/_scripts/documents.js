const Cache = require( "@11ty/eleventy-cache-assets" );
const dotenv = require( "dotenv" );
const Portway = require( "./portway" );

/**
 * Fetch documents from Portway
 *
 * @param {Object} options
 * @param {string} options.apiKey
 * @param {string} options.projectId
 * @param {boolean} options.showDrafts
 * @return {Promise<>Object[]}
 */
module.exports.fetch = async ({apiKey, projectId, showDrafts}) =>
{
	/* Posts */
	let endpointDocuments = `projects/${projectId}/documents`;

	let urlOptions = {};
	if( showDrafts )
	{
		urlOptions.params = {
			draft: true,
		};
	};

	try
	{
		let projectDocuments = await Portway.fetch(
			apiKey,
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
				apiKey,
				endpointPopulatedDocument,
				urlOptions
			);
		});

		return Promise.all( populatedDocuments );
	}
	catch( error )
	{
		console.error( error );
		return [];
	}
};
