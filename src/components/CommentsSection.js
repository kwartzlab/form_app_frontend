import React from 'react';

export default function CommentsSection({ formData, onChange }){
    return (
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={onChange}
            rows="4"
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comments.length}/2000 characters
          </p>
        </div>
    );
}