/* Creates the copy buttons in the header of each stream field */
$(document).ready(function() {
	// All the stream fields with all his content
	var allStreamFields = $('section.w-panel--nested');

	// Setup regex to find field name and fild lang
	var langOpts = wagtailModelTranslations.languages.join('|').replace(/-/g, '_');
	var re = new RegExp(`(.+)?_(${langOpts}){1}`, "g");

	/* Iterate all stream fields, put the copy buttons in each one.*/
	for (var i = 0; i < allStreamFields.length; i++) {
		// Current Field with all content
		var currentStreamField = allStreamFields[i];

		// Current Field header
    	var header = getStreamFieldHeader(currentStreamField);

		// extract field name and field lang from regex, continue if not match
		var fieldNameLang = getStreamFieldName(currentStreamField);
		// .rsplit('_', 1)[-1]
		var fieldLang = fieldNameLang.split('_').pop();
		// .removesuffix(fieldLang)
		var fieldName = fieldNameLang.slice(0, -fieldLang.length - 1);
		if (fieldLang.length === 0 || fieldName.length === 0) continue;

		// The cycle to create the buttons for copy each language field
		var copyContentString = 'Kopieer inhoud van';
		$(header).append(`<div class="translation-field-copy-wrapper">${copyContentString}: </div>`);
		for (var j = 0; j < wagtailModelTranslations.languages.length; j++) {
			currentLangCode = wagtailModelTranslations.languages[j].replace('-', '_');
			if (fieldLang != currentLangCode) {
				var currentFieldID = `${fieldName}_${fieldLang}`;
				var targetFieldID = `${fieldName}_${currentLangCode}`;
				var targetFieldHeader = $(header).children('.translation-field-copy-wrapper')[0];
				targetFieldHeader.innerHTML += `<button class="button translation-field-copy" current-lang-code="${currentFieldID}" data-lang-code="${targetFieldID}">${wagtailModelTranslations.languages[j]}</button>`;
			}
		}
	}

	/* on click binding */
	$('.translation-field-copy').click(function(event) {
		event.preventDefault();
		var lang = $(this).attr('data-lang-code');
		var currentLang = $(this).attr('current-lang-code');
		requestCopyField(lang, currentLang);
	});
});

/* Get header */
function getStreamFieldHeader(currentStreamField) {
	return $(currentStreamField).children('.w-panel__header')[0];
}

function getStreamFieldName(currentStreamField) {
	// returns the streamfield name and language code as '{name}_{lang};
	const sectionId = $(temp1).attr('id')
	// sectionId.split('-')[-2]
	return sectionId.split('-').slice(-2)[0];
}

/* Copy the content of originID field to the targetID field */
function requestCopyField(originID, targetID) {
	/* Get the originID field and convert him to json string */
	var serializedForm = $('#page-edit-form').serializeArray();
	var serializedOriginField = $.grep(
		serializedForm,
		obj => obj.name.indexOf(originID) >= 0
	);
	var jsonString = JSON.stringify(serializedOriginField);

	/*
	 * AJAX request that returns the html content of originID field
	 * with the id's changed to targetID
	 */
	$.ajax({
		url: 'copy_translation_content/',
		headers: {
			"X-CSRFToken": Cookies.get('csrftoken')
		},
		type: 'POST',
		dataType: 'json',
		data: {
			'origin_field_name': originID,
			'target_field_name': targetID,
			'serializedOriginField': jsonString
		},
	})
	.done(function(data) {
		/* Put the html data in the targetID field */
		var wrapperDiv = $(`[name="${targetID}-count"]`).parents('.w-field__input')[0];
		$(wrapperDiv).html(data);
	})
	.fail(function(error) {
		const errorText = error.responseText;
		console.error('wagtail-modeltranslation error: %s', responseText);
	})

}
