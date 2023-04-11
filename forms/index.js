const forms = require('forms'); // require in caolan forms
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

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

// assume that we will pass in all the categories as
// an array in the first argument
const createProductForm = (categories=[], tags=[]) => {
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
            validators:[validators.integer()]
        }),
        "description": fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        }),
        "category_id": fields.string({
            'label': 'Category',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.select(),
            'choices': categories
        }),
        "tags": fields.string({
            'label': 'Tags',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': tags
        })
    })
}

const createUserForm = () => {
    return forms.create({
        'username': fields.string({
            'required': true,
            'errorAfterField': true
        }),
        'email': fields.email({
            'required': true,
            'errorAfterField': true
        }),
        'password': fields.password({
            'required': true,
            'errorAfterField': true
        }),
        'confirm_password': fields.password({
            'required': true,
            'errorAfterField': true,
            // make sure the value of this field matches the `password` field
            'validators': [validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.email({
            'required': true,
            'errorAfterField': true
        }),
        'password': fields.password({
            'required': true,
            'errorAfterField': true
        })
    })
}

module.exports = { bootstrapField,createProductForm, createUserForm, createLoginForm }