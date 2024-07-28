

export const slugGenerator = (title) => {
    console.log(title)
       // Convert to lowercase
       let slug = title.toLowerCase();

       // Replace spaces with hyphens
       slug = slug.replace(/\s+/g, '-');
   
       // Remove non-alphanumeric characters except hyphens
       slug = slug.replace(/[^\w-]/g, '');
   
       // Remove leading and trailing hyphens
       slug = slug.replace(/^-+|-+$/g, '');
   
       return slug;

}