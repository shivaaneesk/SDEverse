const slugify = require('slugify');
const Algorithm = require('../models/Algorithm');

const generateUniqueSlug = async (title) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await Algorithm.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = generateUniqueSlug;
