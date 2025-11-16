import React from 'react';

export default function CommentsSection({ formData, onChange }){
    return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={onChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
    );
}