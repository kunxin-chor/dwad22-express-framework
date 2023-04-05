const forms = require('forms'); // require in caolan forms
const fields = forms.fields;
const vaildiators = forms.validators;

// sophiscated manner:
// const {fields, validators} = require('forms');

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = () => {
    // the only arugment to forms.create is an object
    // each key defines one field in the form (one input element)
    // the value describes the form element
    return forms.create({
        // <input type="text" name="name"/>
        "name": fields.string({
            required: true,
            errorAfterField: true,
        }),
        // <input type="number" name="cost"/>
        "cost": fields.number({
            required: true,
            errorAfterField: true,
            validators:[vaildiators.integer()]
        }),
        "description": fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        })
    })
}

module.exports = { bootstrapField,createProductForm }